from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
import uuid
import time
import json
import hashlib
import base64

from document_loader import load_documents
from spliter import split_document, clean_chunk_metadata
from embedding import create_vector_store
from rag_chain import run_rag_pipeline

app = FastAPI(
    title="RAG Backend API with User Authentication",
    description="Portfolio-grade FastAPI backend with User Authentication & Per-User Vector Isolation",
    version="2.0.0"
)

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration & Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
HISTORY_FOLDER = os.path.join(BASE_DIR, "chat_history")
USERS_FILE = os.path.join(BASE_DIR, "users.json")
DOCUMENTS_FILE = os.path.join(BASE_DIR, "documents_db.json")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HISTORY_FOLDER, exist_ok=True)

# Helper functions for database persistence
def load_json_db(file_path: str) -> dict:
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_json_db(file_path: str, data: dict):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

USERS_DB = load_json_db(USERS_FILE)
DOCUMENTS_DB = load_json_db(DOCUMENTS_FILE)

# Seed default user if not exists
DEFAULT_USER_ID = "user_101"
if DEFAULT_USER_ID not in USERS_DB:
    USERS_DB[DEFAULT_USER_ID] = {
        "user_id": DEFAULT_USER_ID,
        "email": "architect@enterprise.rag.ai",
        "name": "Lead Architect",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    save_json_db(USERS_FILE, USERS_DB)

# Password Hashing & Token Helpers
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: str) -> str:
    payload = f"{user_id}:{int(time.time())}"
    return base64.b64encode(payload.encode()).decode()

def decode_token(token: str) -> Optional[str]:
    try:
        decoded = base64.b64decode(token.encode()).decode()
        user_id = decoded.split(":")[0]
        if user_id in USERS_DB:
            return user_id
    except Exception:
        pass
    return None

def get_current_user_id(
    authorization: Optional[str] = Header(None),
    user_id_param: Optional[str] = Query(None)
) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        uid = decode_token(token)
        if uid:
            return uid
    if user_id_param and user_id_param in USERS_DB:
        return user_id_param
    return DEFAULT_USER_ID

# Pydantic Request/Response Models
class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class QueryRequest(BaseModel):
    question: str
    user_id: Optional[str] = None
    top_k: Optional[int] = 3

# Health Check & API Info
@app.get("/")
async def home():
    return {
        "status": "API Running",
        "version": "2.0.0",
        "auth_enabled": True,
        "default_user": DEFAULT_USER_ID,
        "total_users": len(USERS_DB),
        "total_documents": len(DOCUMENTS_DB)
    }

# AUTHENTICATION ENDPOINTS
@app.post("/auth/register")
async def register_user(request: UserRegisterRequest):
    email_clean = request.email.strip().lower()
    for uid, user in USERS_DB.items():
        if user.get("email", "").lower() == email_clean:
            raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_user_id = f"usr_{uuid.uuid4().hex[:8]}"
    pwd_hash = hash_password(request.password)

    user_data = {
        "user_id": new_user_id,
        "email": email_clean,
        "name": request.name.strip(),
        "password_hash": pwd_hash,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    USERS_DB[new_user_id] = user_data
    save_json_db(USERS_FILE, USERS_DB)

    token = create_token(new_user_id)
    return {
        "status": "success",
        "message": "User registered successfully",
        "token": token,
        "user": {
            "user_id": new_user_id,
            "name": user_data["name"],
            "email": user_data["email"],
            "created_at": user_data["created_at"]
        }
    }

@app.post("/auth/login")
async def login_user(request: UserLoginRequest):
    email_clean = request.email.strip().lower()
    pwd_hash = hash_password(request.password)

    target_user = None
    for uid, user in USERS_DB.items():
        if user.get("email", "").lower() == email_clean and user.get("password_hash") == pwd_hash:
            target_user = user
            break

    if not target_user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_token(target_user["user_id"])
    return {
        "status": "success",
        "token": token,
        "user": {
            "user_id": target_user["user_id"],
            "name": target_user["name"],
            "email": target_user["email"],
            "created_at": target_user.get("created_at", "")
        }
    }

@app.get("/auth/me")
async def get_current_user(active_user_id: str = Depends(get_current_user_id)):
    user = USERS_DB.get(active_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "created_at": user.get("created_at", "")
    }

# DOCUMENT UPLOAD (Per-User Isolated Vector Store)
@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    active_user_id: str = Depends(get_current_user_id)
):
    try:
        allowed_exts = {".pdf", ".json", ".txt", ".text", ".md", ".markdown", ".csv", ".docx", ".doc", ".log"}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"File extension '{file_ext}' is not supported. Allowed formats: PDF, JSON, TXT, MD, CSV, DOCX."
            )

        user_folder = os.path.join(UPLOAD_FOLDER, active_user_id)
        os.makedirs(user_folder, exist_ok=True)

        file_path = os.path.join(user_folder, file.filename)

        file_content = await file.read()
        with open(file_path, "wb") as f:
            f.write(file_content)

        documents = load_documents(file_path)
        if not documents:
            raise HTTPException(status_code=400, detail="Unable to parse text from PDF.")

        chunks = split_document(documents)
        chunks = clean_chunk_metadata(chunks)

        document_id = str(uuid.uuid4())

        for chunk in chunks:
            chunk.metadata["user_id"] = active_user_id
            chunk.metadata["document_id"] = document_id
            chunk.metadata["filename"] = file.filename

        # Create isolated vector store for active user
        create_vector_store(
            chunks=chunks,
            user_id=active_user_id
        )

        doc_meta = {
            "document_id": document_id,
            "filename": file.filename,
            "user_id": active_user_id,
            "size_bytes": len(file_content),
            "chunks_count": len(chunks),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        DOCUMENTS_DB[document_id] = doc_meta
        save_json_db(DOCUMENTS_FILE, DOCUMENTS_DB)

        return {
            "status": "success",
            "message": f"Vector Store collection 'user_{active_user_id}' created successfully.",
            "document_id": document_id,
            "filename": file.filename,
            "chunks_count": len(chunks),
            "user_id": active_user_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CHAT & RAG RESPONSE (Per-User Vector Collection Search)
def save_chat_turn(user_id: str, question: str, answer: str, citations: list):
    history_file = os.path.join(HISTORY_FOLDER, f"{user_id}_history.json")
    history = []
    if os.path.exists(history_file):
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    turn = {
        "id": f"msg_{int(time.time() * 1000)}",
        "question": question,
        "answer": answer,
        "citations": citations,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    history.append(turn)

    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)
    return turn

@app.post("/chat")
@app.post("/response")
async def chat_endpoint(
    request: QueryRequest,
    active_user_id: str = Depends(get_current_user_id)
):
    try:
        user_to_query = request.user_id or active_user_id
        answer, citations = run_rag_pipeline(
            query=request.question,
            user_id=user_to_query,
            top_k=request.top_k or 3
        )

        save_chat_turn(user_to_query, request.question, answer, citations)

        return {
            "status": "success",
            "question": request.question,
            "answer": answer,
            "citations": citations,
            "user_id": user_to_query
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LIST USER DOCUMENTS
@app.get("/documents")
async def list_documents(active_user_id: str = Depends(get_current_user_id)):
    user_folder = os.path.join(UPLOAD_FOLDER, active_user_id)
    user_docs = []

    for doc_id, meta in DOCUMENTS_DB.items():
        if meta.get("user_id") == active_user_id:
            user_docs.append(meta)

        supported_exts = {".pdf", ".json", ".txt", ".text", ".md", ".markdown", ".csv", ".docx", ".doc", ".log"}
        files = [f for f in os.listdir(user_folder) if os.path.splitext(f)[1].lower() in supported_exts]
        for f in files:
            file_path = os.path.join(user_folder, f)
            file_stat = os.stat(file_path)
            doc_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f))
            user_docs.append({
                "document_id": doc_id,
                "filename": f,
                "user_id": active_user_id,
                "size_bytes": file_stat.st_size,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(file_stat.st_mtime)),
                "status": "indexed"
            })

    return {
        "status": "success",
        "user_id": active_user_id,
        "documents": user_docs
    }

# DELETE USER DOCUMENT
@app.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    active_user_id: str = Depends(get_current_user_id)
):
    target_file = None
    if document_id in DOCUMENTS_DB:
        target_file = DOCUMENTS_DB[document_id].get("filename")
        del DOCUMENTS_DB[document_id]
        save_json_db(DOCUMENTS_FILE, DOCUMENTS_DB)

    user_folder = os.path.join(UPLOAD_FOLDER, active_user_id)
    if target_file and os.path.exists(user_folder):
        file_path = os.path.join(user_folder, target_file)
        if os.path.exists(file_path):
            os.remove(file_path)

    return {
        "status": "success",
        "message": f"Document '{document_id}' deleted",
        "document_id": document_id,
        "user_id": active_user_id
    }

# GET CONVERSATION HISTORY
@app.get("/history")
async def get_history(active_user_id: str = Depends(get_current_user_id)):
    history_file = os.path.join(HISTORY_FOLDER, f"{active_user_id}_history.json")
    if os.path.exists(history_file):
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history = json.load(f)
            return {"status": "success", "user_id": active_user_id, "history": history}
        except Exception:
            pass
    return {"status": "success", "user_id": active_user_id, "history": []}

# CLEAR HISTORY
@app.delete("/history")
async def clear_history(active_user_id: str = Depends(get_current_user_id)):
    history_file = os.path.join(HISTORY_FOLDER, f"{active_user_id}_history.json")
    if os.path.exists(history_file):
        os.remove(history_file)
    return {"status": "success", "message": "History cleared", "user_id": active_user_id}