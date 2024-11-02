import logging
from io import BytesIO
from llama_parse import LlamaParse
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    StorageContext,
    Document,
)
from llama_index.vector_stores.milvus import MilvusVectorStore
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from backend.settings.base import FIRECRAWL_API_KEY, ZILLIZ_URI, ZILLIZ_TOKEN
from firecrawl.firecrawl import FirecrawlApp


# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

Settings.llm = OpenAI(model="gpt-4o-mini")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large")


def initalize_vector_store(org_name):
    """
    Initialize the vector store.
    """
    vector_store = MilvusVectorStore(
        uri=ZILLIZ_URI,
        token=ZILLIZ_TOKEN,
        collection_name=org_name,
        dim=3072,
        overwrite=True,
    )
    return StorageContext.from_defaults(vector_store=vector_store)


def train_with_files(files, org_name):
    """
    Train the chatbot with a list of files.
    """
    try:
        storage_context = initalize_vector_store(org_name)
        file_contents = []
        for file in files:
            content = file.read()
            file_contents.append((file.name, BytesIO(content)))

        documents = []
        for file_name, file_content in file_contents:
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


def train_with_urls(urls, org_name):
    """
    Train the chatbot with a list of URLs.
    """
    try:
        storage_context = initalize_vector_store(org_name)
        app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
        documents = []
        for url in urls:
            result = app.scrape_url(url)
            content = result["markdown"]
            doc = Document(text=content, metadata={"url": url})
            documents.append(doc)

        logger.info("Creating index from documents")
        VectorStoreIndex.from_documents(documents, storage_context=storage_context)
        return {"message": "Chatbot trained successfully!", "status": 200}
    except Exception as e:
        logger.error(f"An error occurred while training the chatbot: {str(e)}")
        return {
            "message": "Failed to train the chatbot. Please try again later.",
            "status": 500,
        }
