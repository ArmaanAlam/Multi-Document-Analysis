# 🚀 RAG Intelligence Engine - Enterprise Document Q&A Console

> An enterprise-grade, portfolio-ready Retrieval-Augmented Generation (RAG) platform built with **LangChain**, **ChromaDB**, **FastAPI**, and **React (Vite + Tailwind CSS)** implementing the **Stitch MCP Cognitive Architecture** dark theme.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116%2B-009688)
![React](https://img.shields.io/badge/React-19.0-61DAFB)
![ChromaDB](https://img.shields.io/badge/Vector_DB-ChromaDB-purple)

---

## ✨ Features

- **🔐 User Authentication System**: Built-in user registration and login (`/auth/register`, `/auth/login`, `/auth/me`) with SHA-256 password hashing and Bearer Token authentication.
- **🛡️ Per-User Isolated Vector Stores**: Segregated ChromaDB vector collections (`user_<user_id>`) ensuring complete document privacy and isolated search spaces across accounts.
- **📄 Automated PDF Document Processing**: PyPDF parsing, recursive character text chunking with configurable overlap, and HuggingFace BGE embeddings (`BAAI/bge-small-en-v1.5`).
- **💬 Interactive AI Intelligence Chat**: Structured Markdown answers (Executive Summary, Key Findings, Technical Details) with clickable inline citation badges and a slide-over source context drawer.
- **📊 Real-time Dashboard & Console**: Metric cards for vector engine latency, embedding model status, API throughput, Knowledge Overview Bento token graph, cloud sync status, and recent document management.
- **⚙️ System Configuration**: Configurable parameters for chunk size, chunk overlap, retrieval top-K, temperature, and HuggingFace API hub tokens.

---

## 📁 Repository Structure

```text
RAG/
├── backend/                  # FastAPI Backend API Server
│   ├── app.py                # Main FastAPI Application & Router
│   ├── main.py               # Uvicorn Server Entrypoint Runner
│   ├── document_loader.py    # PyPDF Document Ingestion Pipeline
│   ├── spliter.py            # Recursive Character Text Splitter
│   ├── embedding.py          # HuggingFace BGE Vector Store Creator
│   ├── rag_chain.py          # RAG Retrieval & Synthesis Pipeline
│   ├── retrieval.py          # Similarity & Euclidean Search Engine
│   ├── streamlit.py          # Streamlit UI Alternative
│   └── .env                  # Environment Variables
│
├── frontend/                 # React + TypeScript + Tailwind CSS App
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── Navbar.tsx    # Header with User Profile & Search Bar
│   │   │   ├── Sidebar.tsx   # Fixed Stitch MCP Navigation Bar
│   │   │   ├── DashboardView.tsx   # Dashboard Console
│   │   │   ├── KnowledgeLibraryView.tsx # Intake & Document Manager
│   │   │   ├── ChatView.tsx  # Interactive Intelligence Chat
│   │   │   ├── SettingsView.tsx # System Configuration Settings
│   │   │   ├── SourceDrawer.tsx # Slide-Over Citation Text Inspector
│   │   │   ├── FileUploadModal.tsx # PDF Drag-and-Drop Uploader
│   │   │   └── AuthModal.tsx # Sign In & Registration Modal
│   │   ├── api/
│   │   │   └── client.ts     # API Client with Bearer Token Storage
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript Models & Interfaces
│   │   ├── App.tsx           # Main Application Container
│   │   ├── index.css         # Tailwind CSS & Design System Tokens
│   │   └── main.tsx          # React Root DOM Mount
│   ├── index.html            # Tailwind CDN & Google Fonts
│   ├── package.json          # Node Dependencies
│   └── vite.config.ts        # Vite + Tailwind CSS Config
│
├── .gitignore                # Environment & Data Exclusions
└── README.md                 # Project Documentation
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- **Python**: 3.10+
- **Node.js**: v18+ & `npm`

---

### 1. Backend Setup & Run

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Activate Python environment and install dependencies:
   ```bash
   pip install fastapi uvicorn langchain langchain-community langchain-chroma langchain-huggingface chromadb pypdf python-dotenv
   ```

3. Start the FastAPI Uvicorn server:
   ```bash
   python main.py
   ```
   *The server runs on `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.*

---

### 2. Frontend Setup & Run

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check & system summary |
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Sign in & receive Bearer Token |
| `GET` | `/auth/me` | Fetch active user profile |
| `POST` | `/upload` | Upload & vectorize PDF for user |
| `POST` | `/chat` | Execute RAG similarity search & synthesis |
| `GET` | `/documents` | List user's uploaded documents |
| `DELETE` | `/documents/{id}` | Delete a user document |
| `GET` | `/history` | Fetch user conversation history |
| `DELETE` | `/history` | Clear user conversation history |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
