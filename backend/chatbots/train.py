import logging
from llama_parse import LlamaParse
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    StorageContext,
)
from llama_index.vector_stores.milvus import MilvusVectorStore
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from backend.settings.base import ZILLIZ_URI, ZILLIZ_TOKEN


# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


def train_chatbot(file_contents):
    Settings.llm = OpenAI(model="gpt-4o-mini")
    Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large")

    try:
        vector_store = MilvusVectorStore(
            uri=ZILLIZ_URI,
            token=ZILLIZ_TOKEN,
            collection_name="insurance",
            dim=3072,
            overwrite=True,
        )
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        logger.info("Parsing documents")
        documents = []
        for file_name, file_content in file_contents:
            # Pass the file content as bytes along with the file name
            documents.extend(
                LlamaParse(result_type="markdown").load_data(
                    file_content.getvalue(), extra_info={"file_name": file_name}
                )
            )

        logger.info("Creating index from documents")
        VectorStoreIndex.from_documents(documents, storage_context=storage_context)

        return {"message": "Chatbot trained successfully!", "status": 200}
    except Exception as e:
        logger.error(f"An error occurred while training the chatbot: {str(e)}")
        return {
            "message": "Failed to train the chatbot. Please try again later.",
            "status": 500,
        }
