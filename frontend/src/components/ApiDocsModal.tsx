import React, { useState } from 'react';
import { X, Code, Copy, Check } from 'lucide-react';
import type { ApiEndpointDoc } from '../types';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const endpoints: ApiEndpointDoc[] = [
    {
      method: 'POST',
      endpoint: '/upload',
      summary: 'Upload PDF and Build Vector Store Embeddings',
      description: 'Accepts a PDF document via multipart/form-data, splits it into semantic chunks using BAAI/bge-small-en-v1.5, and persists vector embeddings into Chroma DB.',
      requestHeader: 'Content-Type: multipart/form-data',
      requestBody: `Form Field: file (Binary PDF File)`,
      responseBody: `{
  "status": "success",
  "message": "Vector Store Created Successfully",
  "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "filename": "Attention All You Need.pdf",
  "chunks_count": 14,
  "user_id": "user_101"
}`,
    },
    {
      method: 'POST',
      endpoint: '/chat',
      summary: 'Execute RAG Query & Retrieve Source Citations',
      description: 'Retrieves top-K relevant text chunks from Chroma DB based on Euclidean distance score and uses Meta-Llama-3.1-8B-Instruct to generate grounded answers.',
      requestHeader: 'Content-Type: application/json',
      requestBody: `{
  "question": "What is the Transformer architecture?",
  "user_id": "user_101",
  "top_k": 3
}`,
      responseBody: `{
  "status": "success",
  "question": "What is the Transformer architecture?",
  "answer": "### Answer\\nThe Transformer is a neural network architecture...",
  "citations": [
    {
      "source": "uploads/user_101/Attention All You Need.pdf",
      "filename": "Attention All You Need.pdf",
      "page": 1,
      "chunk_id": 0,
      "score": 0.3542,
      "content": "The dominant sequence transduction models are based on complex recurrent or convolutional..."
    }
  ]
}`,
    },
    {
      method: 'GET',
      endpoint: '/documents',
      summary: 'List Uploaded PDF Documents',
      description: 'Returns all indexed PDF files for a given user ID with document metadata.',
      requestHeader: 'GET /documents?user_id=user_101',
      responseBody: `{
  "status": "success",
  "documents": [
    {
      "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "filename": "Attention All You Need.pdf",
      "size_bytes": 2215400,
      "created_at": "2026-07-26T00:35:00Z",
      "status": "indexed"
    }
  ]
}`,
    },
    {
      method: 'DELETE',
      endpoint: '/documents/:id',
      summary: 'Delete Document from Knowledge Base',
      description: 'Removes the document from disk and deletes associated vector embeddings.',
      requestHeader: 'DELETE /documents/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d?user_id=user_101',
      responseBody: `{
  "status": "success",
  "message": "Document deleted successfully",
  "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}`,
    },
    {
      method: 'GET',
      endpoint: '/history',
      summary: 'Fetch Conversation History',
      description: 'Retrieves prior question-answer turns and citations for session persistence.',
      requestHeader: 'GET /history?user_id=user_101',
      responseBody: `{
  "status": "success",
  "history": [
    {
      "id": "msg_1721950000000",
      "question": "What is the Transformer architecture?",
      "answer": "...",
      "citations": [...],
      "timestamp": "2026-07-26T00:35:10Z"
    }
  ]
}`,
    },
  ];

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 850 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Code className="w-5 h-5 text-cyan-400" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>FastAPI Backend Specification</h3>
          </div>
          <button className="btn btn-ghost" style={{ padding: 4 }} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background:
                      ep.method === 'POST'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : ep.method === 'GET'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                    color:
                      ep.method === 'POST'
                        ? '#60a5fa'
                        : ep.method === 'GET'
                        ? '#34d399'
                        : '#f87171',
                  }}
                >
                  {ep.method}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>
                  {ep.endpoint}
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{ep.summary}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: 12 }}>
                {ep.description}
              </p>

              {ep.requestBody && (
                <div style={{ marginBottom: 12, position: 'relative' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: 4 }}>
                    Request Body:
                  </div>
                  <pre className="code-block">{ep.requestBody}</pre>
                  <button
                    onClick={() => copyCode(ep.requestBody || '', `req_${idx}`)}
                    className="btn btn-ghost"
                    style={{ position: 'absolute', top: 20, right: 6, padding: 4 }}
                  >
                    {copiedKey === `req_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: 4 }}>
                  Response JSON (200 OK):
                </div>
                <pre className="code-block">{ep.responseBody}</pre>
                <button
                  onClick={() => copyCode(ep.responseBody, `res_${idx}`)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: 20, right: 6, padding: 4 }}
                >
                  {copiedKey === `res_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
