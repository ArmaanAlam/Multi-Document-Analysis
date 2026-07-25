# Implementation Plan - Stitch MCP Frontend & Consolidated Backend

Consolidate all backend API files into a dedicated `backend/` directory, update directory paths & imports, and build a full-featured, responsive frontend in `frontend/` implementing the Stitch MCP "AI Document Intelligence Engine" design system.

## Proposed Changes

### Backend Consolidation

#### [NEW] [backend/](file:///d:/Practice/Large%20Language%20Model/RAG/backend)
- Create `backend/` directory.
- Move `app.py`, `document_loader.py`, `embedding.py`, `rag_chain.py`, `retrieval.py`, `spliter.py`, `streamlit.py`, `.env` from workspace root into `backend/`.
- Move `uploads/`, `chat_history/`, `chroma_db/` folders into `backend/`.
- Update file paths in `backend/app.py`, `backend/embedding.py`, `backend/rag_chain.py`, `backend/retrieval.py` to make `uploads`, `chat_history`, `chroma_db` relative to `backend/`.
- Create `backend/main.py` entrypoint script to easily launch the FastAPI app with Uvicorn.

---

### Frontend Implementation (Stitch MCP Design)

#### [MODIFY] [index.css](file:///d:/Practice/Large%20Language%20Model/RAG/frontend/src/index.css)
- Implement Stitch MCP "Cognitive Architecture" Design System tokens:
  - Color palette: Background (`#0b1326`), Surface (`#171f33`), Surface Variant (`#2d3449`), Primary (`#adc6ff` / `#3b82f6`), Secondary (`#4cd7f6`), Tertiary (`#c0c1ff`).
  - Typography: Geist, Inter, JetBrains Mono fonts and Material Symbols / Lucide icon styles.
  - Glassmorphism effects (`glass-card`), glowing borders, pulse animations.

#### [MODIFY] [App.tsx](file:///d:/Practice/Large%20Language%20Model/RAG/frontend/src/App.tsx) & Component Suite
- Implement Navigation & View Switching across standard Stitch MCP screens:
  1. **Dashboard Console**: System metrics (ChromaDB latency, BGE-small embedding model status, API throughput), Knowledge Overview graph, token counts, recent documents table.
  2. **Knowledge Library**: Document uploader dropzone, list of uploaded PDFs, chunk count, file size, deletion.
  3. **Interactive AI Chat**: Full production chat interface with executive summaries, bullet analysis, citations drawer, quick prompt triggers, and message history.
  4. **System Settings**: Configurable RAG parameters (Chunk size, overlap, Top-K, API keys).

#### [MODIFY] [client.ts](file:///d:/Practice/Large%20Language%20Model/RAG/frontend/src/api/client.ts)
- Connect frontend to FastAPI backend endpoints (`/`, `/upload`, `/chat`, `/documents`, `/history`).

## Verification Plan

### Manual Verification
1. Run `python main.py` inside `backend/` and verify FastAPI endpoints respond at `http://127.0.0.1:8000/`.
2. Build `frontend/` using `npm run build` to verify clean TypeScript compilation.
3. Test upload PDF, ask document questions, browse system metrics, and manage document library in the new UI.
