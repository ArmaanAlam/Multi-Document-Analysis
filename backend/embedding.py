import os
from typing import List

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from document_loader import load_documents
from spliter import split_document, clean_chunk_metadata

load_dotenv()


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_vector_store(
    chunks: List[Document],
    user_id: str,
    persist_directory: str = os.path.join(BASE_DIR, "chroma_db")
) -> Chroma:
    """
    Create or update a user's Chroma collection.
    """

    if not chunks:
        raise ValueError("No chunks provided for vector storage.")

    embedding_model = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    collection_name = f"user_{user_id}"

    print(
        f"Embedding {len(chunks)} chunks into collection '{collection_name}'..."
    )

    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embedding_model,
        persist_directory=persist_directory
    )

    # Add new chunks to the collection
    vector_store.add_documents(chunks)

    print("Vector Store Updated Successfully.")

    return vector_store


if __name__ == "__main__":

    USER_ID = "test_user"

    pdf_path = "./upload/Attention All You Need.pdf"

    documents = load_documents(pdf_path)

    if not documents:
        print("No documents loaded.")
        exit()

    chunks = split_document(documents)
    chunks = clean_chunk_metadata(chunks)

    document_id = "demo_document"

    for chunk in chunks:
        chunk.metadata["user_id"] = USER_ID
        chunk.metadata["document_id"] = document_id
        chunk.metadata["filename"] = os.path.basename(pdf_path)

    db = create_vector_store(
        chunks=chunks,
        user_id=USER_ID
    )

    query = "What is the Transformer architecture?"

    print(f"\nQuery: {query}\n")

    results = db.similarity_search(query, k=2)

    for i, doc in enumerate(results, start=1):

        print("=" * 50)
        print(f"Result {i}")
        print("=" * 50)

        print("Metadata:")
        print(doc.metadata)

        print("\nContent:")
        print(doc.page_content[:300])
        print()