import json
import logging
import tiktoken
import urllib.parse
from backend.settings.base import ZILLIZ_URI, ZILLIZ_TOKEN
from channels.generic.websocket import AsyncWebsocketConsumer
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    StorageContext,
    PromptTemplate,
)
from llama_index.core.llms import ChatMessage
from llama_index.core.memory import ChatSummaryMemoryBuffer
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.milvus import MilvusVectorStore

# from .models import Chatbot  # Add this import
from django.apps import apps
from channels.db import database_sync_to_async


logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
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

        # Initialize the chatbot with memory for the user to start the conversation
        self.model = "gpt-4o-mini"
        llm = OpenAI(model=self.model)
        self.tokenizer = tiktoken.encoding_for_model(self.model)
        self.memory = ChatSummaryMemoryBuffer.from_defaults(
            llm=llm, token_limit=256, tokenizer_fn=self.tokenizer.encode
        )
        self.total_tokens = 0

        # Fetch the chatbot details from the database
        self.chatbot = await self.get_chatbot()

        # Fetch the organization name
        self.organization_name = await self.get_organization_name()

        # Create ChatbotUser instance
        self.chatbot_user = await self.create_chatbot_user(
            full_name, email, self.chatbot
        )

        self.memory.put(
            ChatMessage(role="assistant", content=self.chatbot.initial_message)
        )

        self.first_name = full_name.split(" ")[0]

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
        chat_history = self.memory.get()
        history_str = "\n".join(
            [
                f"{msg.role.replace("MessageRole.","")}: {msg.content}"
                for msg in chat_history
            ]
        )

        # Update the ChatbotUser with the chat history
        await self.update_chatbot_user_history(history_str)

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
        self.memory.put(ChatMessage(role="user", content=query))
        self.total_tokens += len(self.tokenizer.encode(query))

        # Get chatbot response
        response = await self.get_chatbot_response(query)

        # Add assistant response to memory and count tokens
        self.memory.put(ChatMessage(role="assistant", content=response))
        self.total_tokens += len(self.tokenizer.encode(response))

        # Get the summarized chat history
        history = self.memory.get()

        await self.send(
            text_data=json.dumps(
                {
                    "query": query,
                    "response": response,
                    "history": [msg.content for msg in history],
                    "total_tokens": self.total_tokens,
                }
            )
        )

    async def get_chatbot_response(self, query):
        Settings.llm = OpenAI(model=self.model)
        Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large")
        try:
            vector_store = MilvusVectorStore(
                uri=ZILLIZ_URI,
                token=ZILLIZ_TOKEN,
                collection_name="insurance",
                dim=3072,
            )

            storage_context = StorageContext.from_defaults(vector_store=vector_store)
            index = VectorStoreIndex.from_vector_store(
                vector_store, storage_context=storage_context
            )

            # Get chat history
            chat_history = self.memory.get()
            chat_history_str = "\n".join(
                [f"{msg.role}: {msg.content}" for msg in chat_history]
            )

            # Define a custom prompt template
            custom_prompt_template = PromptTemplate(
                "You are {name}, a dedicated AI assistant at {organization_name} focused on providing accurate, helpful responses within the scope of the provided context. "
                "Your role is to answer questions related to this specific context, and you are unable to provide information beyond it. However, you may answer "
                "basic questions about yourself, such as your purpose or capabilities, while maintaining a friendly, respectful tone. Address {first_name} by name occasionally, "
                "in a natural and non-repetitive way, to build a polite and friendly connection. Your responses should always be:"
                "\n1. Accurate and based only on the provided context"
                "\n2. Clear, concise, and to the point"
                "\n3. Friendly, respectful, and professional"
                "\nIf asked about topics outside the context, kindly clarify that you’re limited to answering within your focus area and can only offer information "
                "related to this specific context.\n\n"
                "Chat History:\n{chat_history}\n\n"
                "Context: {context_str}\n"
                "Question: {query_str}\n"
                "Answer: "
            )

            query_engine = index.as_query_engine(
                text_qa_template=custom_prompt_template.partial_format(
                    name=self.chatbot.name,
                    chat_history=chat_history_str,
                    first_name=self.first_name,
                    organization_name=self.organization_name,
                ),
            )
            response = await query_engine.aquery(query)
            return response.response
        except Exception as e:
            logger.error(f"An error occurred while processing the question: {str(e)}")
            return "I'm sorry, I'm having trouble processing your question. Please try again later."
