import os
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from document_loader import load_documents
from dotenv import load_dotenv
load_dotenv()


DEFAULT_CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 100))

def split_document(documents : List[Document],
                   chunk_size: int = DEFAULT_CHUNK_SIZE,
                   chunk_overlap: int = DEFAULT_CHUNK_OVERLAP) -> List[Document]:

    if not documents:
        print("No documents to split.")
        return []

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False
    )

    chunks = text_splitter.split_documents(documents)
    print("Split complete.")
    return chunks

def clean_chunk_metadata(chunks: List[Document]) -> List[Document]:
    """
    Strips unnecessary PDF header metadata, retaining only source file and page numbers.
    """
    for idx, chunk in enumerate(chunks):
        essential_meta = {
            "source": chunk.metadata.get("source", ""),
            "page": chunk.metadata.get("page", 0),
            "page_label": chunk.metadata.get("page_label", ""),
            "chunk_id": idx
        }
        chunk.metadata = essential_meta
    return chunks



if __name__ == "__main__":
    valid_pdf_path = "./upload/Attention All You Need.pdf"
    documents = load_documents(valid_pdf_path)


    if documents:
        chunks = split_document(documents)
        clean_chunk_metadata(chunks) #Optional only for those pdf which have lots of Metadata
        print(len(documents))
        print(len(chunks))

        for i, chunk in enumerate(chunks[:4]):
            print(chunk.page_content)
            print(chunk.metadata)
