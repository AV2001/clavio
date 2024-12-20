import json
import logging
import urllib.parse
from backend.settings.base import ZILLIZ_URI, ZILLIZ_TOKEN
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    StorageContext,
)
from django.apps import apps
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
import asyncio


logger = logging.getLogger(__name__)

Settings.llm = OpenAI(model="gpt-4o-mini")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large")


class ExternalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.embed_id = self.scope["url_route"]["kwargs"]["embed_id"]
        await self.accept()

        # Extract user information from connection parameters
        query_string = self.scope["query_string"].decode("utf-8")

        # Only try to parse query params if they exist
        if query_string:
            try:
                query_params = dict(
                    qp.split("=") for qp in query_string.split("&") if "=" in qp
                )
                full_name = urllib.parse.unquote(
                    query_params.get("fullName", "")
                ).replace("+", " ")
                email = urllib.parse.unquote(query_params.get("email", ""))
            except Exception as e:
                logger.error(f"Error parsing query parameters: {str(e)}")

        model = "gpt-4o-mini"
        llm = OpenAI(model=model)

        # self.tokenizer = tiktoken.encoding_for_model(model)
        # self.memory = ChatSummaryMemoryBuffer.from_defaults(
        #     llm=llm, token_limit=256, tokenizer_fn=self.tokenizer.encode
        # )
        self.total_tokens = 0

        # Fetch the chatbot details from the database
        self.chatbot = await self.get_chatbot()

        # Fetch the organization name
        organization_name = await self.get_organization_name()

        # Create ChatbotUser instance
        self.chatbot_user = await self.create_chatbot_user(
            full_name, email, self.chatbot
        )

        # self.memory.put(
        #     ChatMessage(role="assistant", content=self.chatbot.initial_message)
        # )

        first_name = full_name.split(" ")[0]

        # Initialize vector store
        vector_store = MilvusVectorStore(
            uri=ZILLIZ_URI,
            token=ZILLIZ_TOKEN,
            collection_name=organization_name,
            dim=3072,
        )

        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        self.index = VectorStoreIndex.from_vector_store(
            vector_store, storage_context=storage_context
        )

        # Update the initialization of tools and agent
        query_engine = self.index.as_query_engine()
        tools = [
            QueryEngineTool(
                query_engine=query_engine,
                metadata=ToolMetadata(
                    name="knowledge_retriever",
                    description="Use for retrieving information from the knowledge base",
                ),
            ),
        ]

        context = """
        "You are {name}, a dedicated AI assistant at {organization_name} focused on providing accurate, helpful responses within the scope of the provided context. "
        "Your role is to answer questions related to this specific context, and you are unable to provide information beyond it. However, you may answer "
        "basic questions about yourself, such as your purpose or capabilities, while maintaining a friendly, respectful tone. Address {first_name} by name occasionally, "
        "in a natural and non-repetitive way, to build a polite and friendly connection. Your responses should always be:"
        "\n1. Accurate and based only on the provided context"
        "\n2. Clear, concise, and to the point"
        "\n3. Friendly, respectful, and professional"
        "\nIf asked about topics outside the context, kindly clarify that you're limited to answering within your focus area and can only offer information "
        "related to this specific context."
        """

        self.agent = ReActAgent.from_tools(
            tools=tools,
            llm=llm,
            verbose=True,
            context=context.format(
                name=self.chatbot.name,
                organization_name=organization_name,
                first_name=first_name,
            ),
        )

        # Send the initial message
        await self.send(
            text_data=json.dumps(
                {
                    "response": self.chatbot.initial_message,
                    "history": [self.chatbot.initial_message],
                    "total_tokens": self.total_tokens,
                }
            )
        )

    @database_sync_to_async
    def get_chatbot(self):
        Chatbot = apps.get_model("chatbots", "Chatbot")
        return Chatbot.objects.get(embed_id=self.embed_id)

    @database_sync_to_async
    def get_organization_name(self):
        return self.chatbot.organization.name

    @database_sync_to_async
    def create_chatbot_user(self, full_name, email, chatbot):
        ChatbotUser = apps.get_model("chatbots", "ChatbotUser")
        return ChatbotUser.objects.create(
            full_name=full_name, email=email, chatbot=chatbot
        )

    async def disconnect(self, close_code):
        logger.info(f"Total tokens used in this session: {self.total_tokens}")

        # Get the chat history
        # chat_history = self.memory.get()
        # history_str = "\n".join(
        #     [
        #         f"{msg.role.replace("MessageRole.","")}: {msg.content}"
        #         for msg in chat_history
        #     ]
        # )

        # # Update the ChatbotUser with the chat history
        # await self.update_chatbot_user_history(history_str)

    @database_sync_to_async
    def update_chatbot_user_history(self, history):
        ChatbotUser = apps.get_model("chatbots", "ChatbotUser")
        chatbot_user = ChatbotUser.objects.get(id=self.chatbot_user.id)
        if chatbot_user:
            chatbot_user.history = history
            chatbot_user.save()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        query = text_data_json.get("query")

        if not query:
            return

        # Add user message to memory and count tokens
        # self.memory.put(ChatMessage(role="user", content=query))
        # self.total_tokens += len(self.tokenizer.encode(query))

        # Get chatbot response
        response = await self.get_chatbot_response(query)

        # Add assistant response to memory and count tokens
        # self.memory.put(ChatMessage(role="assistant", content=response))
        # self.total_tokens += len(self.tokenizer.encode(response))

        # Get the summarized chat history
        # history = self.memory.get()

        await self.send(
            text_data=json.dumps(
                {
                    "query": query,
                    "response": response,
                    # "history": [msg.content for msg in history],
                    "total_tokens": self.total_tokens,
                }
            )
        )

    async def get_chatbot_response(self, query):
        try:
            # Use ReAct Agent for response generation
            response = self.agent.chat(query)

            print("👇👇👇����👇")
            print(type(response))

            # Extract the response text from the AgentChatResponse object
            response_text = str(response.response)
            return response_text

        except Exception as e:
            logger.error(f"An error occurred while processing the question: {str(e)}")
            return "I'm sorry, I'm having trouble processing your question. Please try again later."


class InternalChatConsumer:
    def __init__(self, chatbot_id, email, websocket=None):
        self.chatbot_id = chatbot_id
        self.email = email
        self.total_tokens = 0
        print(
            f"Initializing InternalChatConsumer for chatbot_id: {chatbot_id}, email: {email}"
        )

        # Initialize LLM
        model = "gpt-4o-mini"
        self.llm = OpenAI(model=model)

        # Initialize other attributes
        self.chatbot = None
        self.chatbot_user = None
        self.index = None
        self.agent = None

    @database_sync_to_async
    def create_chatbot_user(self, email, chatbot):
        ChatbotUser = apps.get_model("chatbots", "ChatbotUser")
        return ChatbotUser.objects.create(email=email, chatbot=chatbot)

    async def initialize(self):
        print("Initializing chatbot and agent...")
        # Fetch the chatbot details from the database
        self.chatbot = await self.get_chatbot()
        print(f"Chatbot details: {self.chatbot}")

        # Fetch the organization name
        organization_name = await self.get_organization_name()
        print(f"Organization name: {organization_name}")

        # Create ChatbotUser instance with correct parameters
        self.chatbot_user = await self.create_chatbot_user(
            email=self.email, chatbot=self.chatbot
        )
        print(f"ChatbotUser created: {self.chatbot_user}")

        # Initialize vector store
        vector_store = MilvusVectorStore(
            uri=ZILLIZ_URI,
            token=ZILLIZ_TOKEN,
            collection_name=organization_name,
            dim=3072,
        )

        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        self.index = VectorStoreIndex.from_vector_store(
            vector_store, storage_context=storage_context
        )

        # Initialize tools and agent
        query_engine = self.index.as_query_engine()
        tools = [
            QueryEngineTool(
                query_engine=query_engine,
                metadata=ToolMetadata(
                    name="knowledge_retriever",
                    description="Use for retrieving information from the knowledge base",
                ),
            ),
        ]

        context = """
        "You are a dedicated AI assistant at {organization_name} focused on providing accurate, helpful responses within the scope of the provided context. "
        "Your role is to answer questions related to this specific context, and you are unable to provide information beyond it. However, you may answer "
        "basic questions about yourself, such as your purpose or capabilities, while maintaining a professional and respectful tone. Your responses should always be:"
        "\n1. Accurate and based only on the provided context"
        "\n2. Clear, concise, and to the point"
        "\n3. Professional and respectful"
        "\nIf asked about topics outside the context, kindly clarify that you're limited to answering within your focus area and can only offer information "
        "related to this specific context."
        """

        self.agent = ReActAgent.from_tools(
            tools=tools,
            llm=self.llm,
            verbose=True,
            context=context.format(
                name=self.chatbot.name,
                organization_name=organization_name,
                first_name="User",
            ),
        )
        print("Agent initialized.")

    @database_sync_to_async
    def get_chatbot(self):
        Chatbot = apps.get_model("chatbots", "Chatbot")
        return Chatbot.objects.get(id=self.chatbot_id)

    @database_sync_to_async
    def get_organization_name(self):
        return self.chatbot.organization.name

    async def get_response(self, query):
        try:
            print(f"Getting response for query: {query}")
            # Get the response object
            response = self.agent.chat(query)

            # Get the full response text
            response_text = str(response.response)
            current_response = ""

            # Stream word by word
            words = response_text.split()
            for word in words:
                current_response += word + " "
                yield {
                    "type": "stream",
                    "chunk": word + " ",
                    "full_response": current_response,
                }
                print(f"🔹 Chunk sent: {word}", flush=True)
                await asyncio.sleep(0.1)  # Smaller delay for smoother streaming

            # Yield final message
            yield {
                "type": "final",
                "response": current_response.strip(),
                "total_tokens": self.total_tokens,
            }
            print("✅ Stream completed")

        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            print("❌ Stream error occurred")
            yield {"type": "error", "error": str(e)}


class ChatbotStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chatbot_id = self.scope["url_route"]["kwargs"]["chatbot_id"]
        self.room_group_name = f"chatbot_{self.chatbot_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chatbot_status(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps(message))
