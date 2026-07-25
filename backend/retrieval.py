import os
import numpy as np
from typing import List, Tuple
from dotenv import load_dotenv

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()


def load_vector_store(persist_directory: str = "./chroma_db") -> Chroma:

    if not os.path.exists(persist_directory):
        raise FileNotFoundError(
            f"Vector database directory '{persist_directory}' does not exist. "
            "Please run embedding/creation step first!"
        )

    # Initialize the matching embedding model
    embedding_model = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    # Load existing Chroma database
    vector_store = Chroma(
        persist_directory=persist_directory,
        embedding_function=embedding_model
    )
    return vector_store, embedding_model


def calculate_euclidean_distance(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Calculates explicit Euclidean Distance (L2 norm) between two embedding vectors.
    Formula: sqrt(sum((a_i - b_i)^2))
    """
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.linalg.norm(a - b))


def search_by_euclidean_vector(
        vector_store: Chroma,
        embedding_model: HuggingFaceEmbeddings,
        query: str,
        top_k: int = 3
) -> List[Tuple[Document, float]]:
    """
    1. Converts query text into a vector.
    2. Performs vector retrieval with explicit L2/Euclidean scoring.
    3. Returns top_k documents paired with Euclidean distance (lower = more similar).
    """
    print(f"\nEmbedding query: '{query}'...")
    query_vector = embedding_model.embed_query(query)

    # Search ChromaDB using the query vector directly (returns (Document, Euclidean Distance))
    results_with_scores = vector_store.similarity_search_by_vector_with_relevance_scores(
        embedding=query_vector,
        k=top_k
    )

    # Alternative: Using direct similarity search with distance
    # Chroma uses squared Euclidean (L2) distance as its default space
    raw_results = vector_store.similarity_search_with_score(query, k=top_k)

    print("=" * 60)
    print("Retrieved:", len(raw_results))

    for i, (doc, score) in enumerate(raw_results):
        print(f"\nResult {i + 1}")
        print("Score:", score)
        print(doc.page_content[:300])

    return raw_results


if __name__ == "__main__":
    try:
        # 1. Connect to ChromaDB
        db, embed_model = load_vector_store("./chroma_db")

        # 2. Accept continuous user queries from command line
        while True:
            user_query = input("\nEnter your question (or type 'exit' to quit): ").strip()

            if user_query.lower() in ["exit", "quit", "q"]:
                print("Exiting retrieval pipeline...")
                break

            if not user_query:
                continue

            # 3. Retrieve Top Match chunks
            top_results = search_by_euclidean_vector(
                vector_store=db,
                embedding_model=embed_model,
                query=user_query,
                top_k=2
            )

            print(f"\n================ TOP {len(top_results)} RANKED RESULTS ================")
            for rank, (doc, score) in enumerate(top_results, start=1):
                print(f"\n--- Rank #{rank} (Euclidean Distance: {score:.4f}) ---")
                print("Source Metadata:", doc.metadata)
                print("Content Snippet:")
                print(doc.page_content.replace("\n", " ") + "...")
                print("-" * 55)

    except FileNotFoundError as e:
        print(f"Error: {e}")