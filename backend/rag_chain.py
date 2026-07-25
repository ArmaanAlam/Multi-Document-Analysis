import os
from typing import List, Tuple
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_huggingface import HuggingFaceEmbeddings
load_dotenv()



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")

def load_vector_store(user_id: str, persist_directory: str = DEFAULT_CHROMA_DIR):

    if not os.path.exists(persist_directory):
        raise FileNotFoundError(f"Directory '{persist_directory}' not found. Run embedding step first.")

    embedding_model = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )
    vector_store = Chroma(
        collection_name=f"user_{user_id}",
        persist_directory=persist_directory,
        embedding_function=embedding_model
    )
    return vector_store


def format_context(raw_results: List[Tuple[Document, float]]) -> str:
    context_blocks = []
    for rank, (doc, score) in enumerate(raw_results, start=1):
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", 0)
        chunk_id = doc.metadata.get("chunk_id", "N/A")

        block = (
            f"[Source {rank}: Page {page}, Chunk {chunk_id}]\n"
            f"{doc.page_content}"
        )
        context_blocks.append(block)

    return "\n\n---\n\n".join(context_blocks)


import re

def clean_pdf_text(text: str) -> str:
    """
    Cleans up common OCR and PDF extraction artifacts such as broken words,
    repeated header strings, and extra whitespace.
    """
    if not text:
        return ""

    # Fix broken words split by PDF kerning (e.g., "T ools" -> "Tools", "PyT orch" -> "PyTorch")
    text = re.sub(r'\b([A-Z])\s+([a-z]{2,})\b', r'\1\2', text)
    text = re.sub(r'\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b', r'\1 \2', text)

    # Replace repeated string patterns (e.g. "GitHubGitHubGitHub..." -> "GitHub")
    text = re.sub(r'(GitHub){2,}', 'GitHub', text)
    text = re.sub(r'(PyTorch){2,}', 'PyTorch', text)
    text = re.sub(r'([A-Za-z0-9_\-\.\/]{3,})\1{2,}', r'\1', text)

    # Normalize bullet points and spacing
    text = re.sub(r'[•\*\-]\s*', '\n- ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def build_structured_production_response(query: str, raw_results: List[Tuple[Document, float]]) -> str:
    """
    Synthesizes raw document chunks into a clean, Gemini/ChatGPT-style detailed answer.
    """
    cleaned_chunks = []
    for rank, (doc, score) in enumerate(raw_results, start=1):
        filename = doc.metadata.get("filename", os.path.basename(doc.metadata.get("source", "Document")))
        page = doc.metadata.get("page", 1)
        cleaned_content = clean_pdf_text(doc.page_content)
        if cleaned_content:
            cleaned_chunks.append({
                "filename": filename,
                "page": page,
                "content": cleaned_content
            })

    if not cleaned_chunks:
        return "### ⚠️ Context Unavailable\n\nUnable to extract readable text from the retrieved document."

    first_doc = cleaned_chunks[0]['filename']
    first_page = cleaned_chunks[0]['page']

    summary_paragraph = (
        f"Based on the analysis of **{first_doc}** (Page {first_page}), "
        f"here is a detailed breakdown addressing **\"{query}\"**:"
    )

    findings_bullets = []
    for chunk in cleaned_chunks:
        lines = [
            line.strip() for line in chunk['content'].split('\n')
            if line.strip() and not line.strip().startswith('[Source') and not line.strip().startswith('http')
        ]
        for line in lines:
            clean_line = line.lstrip('-*• ').strip()
            if len(clean_line) > 20 and clean_line not in [b.split(': ', 1)[-1] for b in findings_bullets]:
                findings_bullets.append(f"- **{chunk['filename']} (Pg {chunk['page']})**: {clean_line}")

    if findings_bullets:
        insights_text = "\n".join(findings_bullets[:7])
    else:
        insights_text = f"- Document page {first_page} outlines key information regarding {query}."

    formatted_response = f"""### 📌 Overview

{summary_paragraph}

---

### 🔍 Detailed Analysis & Insights

{insights_text}

---

### 💡 Key Takeaways

- The document provides relevant context and specifications directly answering **"{query}"**.
- Refer to the citation badges below for exact page-level source references.
"""
    return formatted_response


def run_rag_pipeline(query: str, user_id: str, top_k: int = 3):
    """
    Complete Production RAG Workflow:
    Query -> Retrieve Chunks -> Format Context -> Prompt -> Structured Production Output
    Returns (answer_text, citations_list)
    """
    # 1. Load Vector DB
    try:
        vector_store = load_vector_store(
            user_id=user_id,
            persist_directory=DEFAULT_CHROMA_DIR
        )
        raw_results = vector_store.similarity_search_with_score(query, k=top_k)
    except Exception as e:
        print(f"Error accessing vector store: {e}")
        raw_results = []

    citations = []
    if raw_results:
        for idx, (doc, score) in enumerate(raw_results):
            cleaned_text = clean_pdf_text(doc.page_content)
            citations.append({
                "source": doc.metadata.get("source", "Unknown"),
                "filename": doc.metadata.get("filename", os.path.basename(doc.metadata.get("source", "Document.pdf"))),
                "page": doc.metadata.get("page", 1),
                "chunk_id": doc.metadata.get("chunk_id", idx),
                "score": float(score) if isinstance(score, (float, int)) else 0.0,
                "content": cleaned_text
            })

    if not raw_results:
        answer_text = "### ⚠️ No Document Context Found\n\nNo relevant document context was found in the vector database. Please upload a PDF report first to enable document question answering."
        return answer_text, citations

    # 3. Format context string from retrieved tuples
    formatted_context = format_context(raw_results)

    # 4. Construct System + User Prompt
    prompt_template = ChatPromptTemplate.from_template("""
You are an expert AI research assistant (like Gemini and ChatGPT).
Your task is to provide a comprehensive, highly insightful, and beautifully formatted answer to the user's question, strictly based on the provided document context.

## Answer & Formatting Guidelines:
1. **Provide Deep Insights**: Thoroughly answer the question with detailed analysis, clear explanations, and specific evidence from the context.
2. **Professional Structure**: Use clean markdown sections:
   - ### 📌 Overview
   - ### 🔍 Detailed Analysis & Insights (use clean, bulleted points with bold keywords)
   - ### 💡 Core Takeaways
3. **NO System Metadata or Self-Reference**: Do NOT mention internal mechanics, vector databases, ChromaDB, embeddings, top-k scoring, or prompt rules. Respond naturally, directly, and professionally to the user.
4. **Clean Presentation**: Do not include raw context brackets, OCR artifacts, or unformatted text.

Retrieved Context:
{context}

User Question:
{question}

Answer:
    """)

    # 5. Initialize LLM
    try:
        if os.getenv("HF_TOKEN"):
            llm = HuggingFaceEndpoint(
                repo_id="meta-llama/Llama-3.1-8B-Instruct",
                task="text-generation",
                huggingfacehub_api_token=os.getenv("HF_TOKEN"),
                temperature=0.2,
                max_new_tokens=512,
            )
            llm = ChatHuggingFace(llm=llm)
            prompt = prompt_template.format(context=formatted_context, question=query)
            response = llm.invoke(prompt)

            if isinstance(response.content, list):
                answer_text = "".join([
                    block["text"] for block in response.content
                    if isinstance(block, dict) and block.get("type") == "text"
                ])
            else:
                answer_text = str(response.content)

            # Ensure answer text has structured headers
            if not answer_text.startswith("#"):
                answer_text = f"### 💡 Answer\n\n{answer_text}"
        else:
            # Fallback to structured production synthesizer if HF_TOKEN is not set
            answer_text = build_structured_production_response(query, raw_results)
    except Exception as e:
        print(f"Error calling LLM endpoint: {e}")
        answer_text = build_structured_production_response(query, raw_results)

    print("\n" + "=" * 25 + " LLM ANSWER " + "=" * 25)
    try:
        print(answer_text)
    except UnicodeEncodeError:
        print(answer_text.encode('ascii', errors='backslashreplace').decode('ascii'))
    print("=" * 65)

    return answer_text, citations



if __name__ == "__main__":
    while True:
        user_query = input("\nAsk a question about the document (or 'exit'): ").strip()
        if user_query.lower() in ["exit", "quit", "q"]:
            break
        if user_query:
            run_rag_pipeline(user_query)