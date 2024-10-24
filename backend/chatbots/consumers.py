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
        query_params = dict(qp.split("=") for qp in query_string.split("&"))

        full_name = urllib.parse.unquote(query_params.get("fullName", ""))
        email = urllib.parse.unquote(query_params.get("email", ""))

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

        # Create ChatbotUser instance
        await self.create_chatbot_user(full_name, email, self.chatbot)

        self.memory.put(
            ChatMessage(role="assistant", content=self.chatbot.initial_message)
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
    def create_chatbot_user(self, full_name, email, chatbot):
        ChatbotUser = apps.get_model("chatbots", "ChatbotUser")
        return ChatbotUser.objects.create(
            full_name=full_name, email=email, chatbot=chatbot
        )

    async def disconnect(self, close_code):
        logger.info(f"Total tokens used in this session: {self.total_tokens}")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        query = text_data_json["query"]

        # Add user query to memory and count tokens
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
        logger.info(f"Processing question: {query}")

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
                "You are a friendly human, here to help with questions the user asks just like a human would based on the context provided."
                "Be friendly and conversational, not robotic. Use their name occasionally to make the conversation more natural."
                "The answer should be concise and accurate based on the context provided."
                "If the question is not related to the uploaded documents or the specific domain you're trained on, politely redirect the user to ask about relevant topics. Last but not least, do not mention anything about documents in the answer. Based on what the user asks and the answer you provide, try to come up with a follow up question that the user might ask next.\n\n"
                "Chat History:\n{chat_history}\n\n"
                "Context: {context_str}\n"
                "Question: {query_str}\n"
                "Answer: "
            )

            query_engine = index.as_query_engine(
                text_qa_template=custom_prompt_template.partial_format(
                    chat_history=chat_history_str
                )
            )
            logger.info("Querying the index")
            response = await query_engine.aquery(query)
            logger.info("Response generated successfully")

            return response.response
        except Exception as e:
            logger.error(f"An error occurred while processing the question: {str(e)}")
            return f"An error occurred while processing your question: {str(e)}"
