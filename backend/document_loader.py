import os
import json
from pathlib import Path
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    CSVLoader,
)

SUPPORTED_EXTENSIONS = {
    ".pdf", ".json", ".txt", ".text", ".md", ".markdown", ".csv", ".docx", ".doc", ".log"
}

def load_documents(file_path: str) -> List[Document]:
    path = Path(file_path)
    try:
        if not path.exists():
            raise FileNotFoundError(f"File not found at path: {path.resolve()}")

        ext = path.suffix.lower()

        if ext == ".pdf":
            loader = PyPDFLoader(str(path))
            documents = loader.load()
            print(f"Successfully loaded PDF: {len(documents)} pages.")
            return documents

        elif ext in [".txt", ".text", ".md", ".markdown", ".log"]:
            loader = TextLoader(str(path), encoding="utf-8")
            documents = loader.load()
            print(f"Successfully loaded Text/Markdown document: {len(documents)} pages.")
            return documents

        elif ext == ".csv":
            loader = CSVLoader(str(path), encoding="utf-8")
            documents = loader.load()
            print(f"Successfully loaded CSV document: {len(documents)} rows.")
            return documents

        elif ext == ".json":
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            content = json.dumps(data, indent=2) if isinstance(data, (dict, list)) else str(data)
            documents = [
                Document(
                    page_content=content,
                    metadata={"source": str(path), "filename": path.name, "page": 1}
                )
            ]
            print(f"Successfully loaded JSON document.")
            return documents

        elif ext in [".docx", ".doc"]:
            try:
                from langchain_community.document_loaders import Docx2txtLoader
                loader = Docx2txtLoader(str(path))
                return loader.load()
            except Exception:
                loader = TextLoader(str(path), encoding="utf-8")
                return loader.load()

        else:
            # Fallback loader for text files
            try:
                loader = TextLoader(str(path), encoding="utf-8")
                return loader.load()
            except Exception as ex:
                print(f"Unsupported or unparseable file format '{ext}': {ex}")
                return []

    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []

if __name__ == "__main__":
    test_path = "./uploads/test.txt"
    if os.path.exists(test_path):
        docs = load_documents(test_path)
        print("Loaded test docs:", len(docs))
