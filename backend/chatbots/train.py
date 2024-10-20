from llama_parse import LlamaParse
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    StorageContext,
    PromptTemplate,
)
from llama_index.vector_stores.milvus import MilvusVectorStore
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# Load environment variables
load_dotenv()

# Initialize global variables
storage_context = None
query_engine = None


# training the chatbot
def train_chatbot(name, file_path):
    global storage_context, query_engine
    if storage_context is None:
        Settings.llm = OpenAI(model="gpt-4o-mini")
        Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large")
        vector_store = MilvusVectorStore(
            uri="https://in03-6542ce29e53d1b6.serverless.gcp-us-west1.cloud.zilliz.com",
            token="184b9633d9a8b52ce99bc0cc7615742bd98190124cf906c085f86f0f84e119d3aa572e30c7ba0bf65c3f4ddbd9179ae0a0d1d07e",
            collection_name="insurance",
            dim=3072,
            overwrite=True,
        )
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

    documents = LlamaParse(result_type="markdown").load_data(file_path)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)

    # Define a custom prompt template
    custom_prompt_template = PromptTemplate(
        "You are a friendly assistant from RakBank, here to help with questions about the uploaded PDF documents. "
        "Please provide a concise and accurate answer based on the context provided. "
        "If the question is about banking but the answer is not in the context, say 'Sorry, I do not know the answer to this.'\n"
        "If the question is not related to banking or the uploaded documents, politely redirect the user to ask about banking or the documents.\n\n"
        "Context: {context_str}\n"
        "Question: {query_str}\n"
        "Answer: "
    )

    query_engine = index.as_query_engine(text_qa_template=custom_prompt_template)

    return query_engine
    # return "PDF processed successfully. You can now ask questions."


def chat_with_pdf(question):
    global query_engine
    if query_engine is None:
        return "Please process a PDF file first."
    try:
        response = query_engine.query(question)
        return response.response
    except Exception as e:
        return f"An error occurred: {str(e)}"
