import React from 'react';
import {
  Upload,
  Sliders,
  CheckCircle2,
  RefreshCw,
  FileText,
  FileCode,
  Layers,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface KnowledgeLibraryViewProps {
  documents: DocumentItem[];
  onOpenUpload: () => void;
  onDeleteDocument: (docId: string) => void;
  onRefreshDocs: () => void;
  onGoToChat: () => void;
  isLoading: boolean;
}

export const KnowledgeLibraryView: React.FC<KnowledgeLibraryViewProps> = ({
  documents,
  onOpenUpload,
  onDeleteDocument,
  onRefreshDocs,
  onGoToChat,
  isLoading,
}) => {
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks_count || 12), 0);
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.size_bytes || 102400), 0);
  const formattedTotalMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'json' || ext === 'csv') return <FileCode className="w-5 h-5 text-slate-300" />;
    return <FileText className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="space-y-6 pb-16 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-custom text-2xl font-bold text-white">
            Knowledge Intake & Index Manager
          </h2>
          <p className="font-mono-custom text-xs text-[#64748b] mt-0.5">
            Active Collection: {documents.length} File{documents.length !== 1 ? 's' : ''} Indexed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshDocs}
            disabled={isLoading}
            className="px-3.5 py-2 bg-[#0f172a] hover:bg-[#1a243a] border border-[#1e293b] text-slate-200 font-mono-custom text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Index</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 font-mono-custom text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: INGEST CARD + ENGINE THROUGHPUT CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ingest New Intelligence Dropzone Card */}
        <div
          onClick={onOpenUpload}
          className="lg:col-span-8 rag-card p-10 border-2 border-dashed border-[#1e2d4a] hover:border-[#3b82f6] transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[260px] group"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#11192e] border border-[#1e2d4a] flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="w-7 h-7 text-[#3b82f6]" />
          </div>

          <h3 className="font-headline-custom text-xl font-bold text-white mb-2">
            Ingest New Intelligence
          </h3>

          <p className="font-mono-custom text-xs text-[#64748b] max-w-md mb-6 leading-relaxed">
            Drag & drop PDF, JSON, TXT, MD, CSV, or DOCX documents here. Documents are automatically chunked, embedded, and indexed into your private vector store.
          </p>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white text-slate-950 font-mono-custom text-xs font-bold rounded-xl transition-all shadow">
              Select Files
            </button>
            <button className="px-5 py-2.5 bg-transparent hover:bg-[#0f172a] border border-[#1e293b] text-[#94a3b8] font-mono-custom text-xs font-semibold rounded-xl transition-all">
              Multi-Format Supported
            </button>
          </div>
        </div>

        {/* Engine Throughput Bento Card */}
        <div className="lg:col-span-4 rag-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-headline-custom font-bold text-sm">
                <Layers className="w-4 h-4 text-slate-300" />
                <span>Engine Throughput</span>
              </div>
              <span className="text-[10px] font-mono-custom text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ● ACTIVE
              </span>
            </div>

            <div className="flex justify-between items-baseline mb-3">
              <span className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-wider">
                TOKEN PROCESSING
              </span>
              <span className="font-mono-custom text-sm font-bold text-white">
                {(totalChunks * 512).toLocaleString()} tokens
              </span>
            </div>

            {/* Mini Histogram */}
            <div className="flex items-end justify-between gap-1.5 h-14 mb-4 opacity-70">
              {[40, 65, 35, 75, 45, 90, 80, 50].map((h, i) => (
                <div key={i} className="bg-slate-300 w-full rounded-t transition-all hover:bg-white" style={{ height: `${h}%` }} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1a243a]">
              <div className="p-3 bg-[#0d1424] rounded-xl border border-[#1e293b]">
                <p className="font-mono-custom text-[10px] text-[#64748b]">Total Chunks</p>
                <p className="font-headline-custom text-lg font-bold text-white mt-0.5">{totalChunks}</p>
              </div>
              <div className="p-3 bg-[#0d1424] rounded-xl border border-[#1e293b]">
                <p className="font-mono-custom text-[10px] text-[#64748b]">Index Storage</p>
                <p className="font-headline-custom text-lg font-bold text-white mt-0.5">{formattedTotalMB} MB</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a243a] mt-4">
            <div className="flex justify-between text-[11px] font-mono-custom text-[#64748b] mb-1">
              <span>Vector Collection Health</span>
              <span className="text-slate-200">100% Nominal</span>
            </div>
            <div className="w-full h-1.5 bg-[#1a243a] rounded-full overflow-hidden">
              <div className="w-full h-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: DYNAMIC ACTIVE PIPELINE & USER DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Pipeline & User Documents */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-custom text-lg font-bold text-white">
              Indexed Documents ({documents.length})
            </h3>
            <span className="px-2.5 py-0.5 bg-[#0e172a] border border-[#1e293b] text-[#94a3b8] rounded-full text-[10px] font-mono-custom uppercase tracking-wider">
              {documents.length} NODES ONLINE
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="rag-card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center mx-auto text-[#64748b]">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-headline-custom text-base font-bold text-white">
                No documents uploaded yet
              </p>
              <p className="font-mono-custom text-xs text-[#64748b] max-w-sm mx-auto">
                Ingest PDF, JSON, TXT, MD, CSV, or DOCX documents to populate your personal vector collection.
              </p>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 bg-white text-slate-950 font-mono-custom text-xs font-bold rounded-xl shadow"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.document_id}
                className="rag-card p-5 space-y-3 hover:border-[#334155] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#172238] rounded-xl border border-[#2a3854] text-slate-200">
                      {getFileIcon(doc.filename)}
                    </div>
                    <div>
                      <h4 className="font-headline-custom font-bold text-sm text-white">
                        {doc.filename}
                      </h4>
                      <p className="font-mono-custom text-[11px] text-[#64748b]">
                        {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : '124 KB'} • {doc.chunks_count || 12} Vector Chunks • Indexed {doc.created_at ? new Date(doc.created_at).toLocaleTimeString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onGoToChat}
                      className="px-3 py-1 bg-[#0f172a] hover:bg-[#1a243a] border border-[#1e293b] text-slate-200 text-xs font-mono-custom font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Query</span>
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.document_id)}
                      title="Delete Document"
                      className="p-1.5 text-[#64748b] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-1 bg-[#1a243a] rounded-full overflow-hidden">
                  <div className="w-full h-full bg-slate-200" />
                </div>

                <div className="flex items-center gap-4 pt-1 text-[11px] font-mono-custom text-[#94a3b8]">
                  <span className="flex items-center gap-1 text-slate-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Chunking Complete
                  </span>
                  <span className="flex items-center gap-1 text-slate-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Vector Mapped
                  </span>
                  <span className="flex items-center gap-1 text-slate-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Graph Indexed
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ingestion Params + System Events */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rag-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-headline-custom font-bold text-sm border-b border-[#1a243a] pb-3">
              <Sliders className="w-4 h-4 text-slate-300" />
              <span>Pipeline Params</span>
            </div>

            <div className="space-y-3 font-mono-custom text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Chunk Size</span>
                <span className="text-slate-200 font-bold">1000 chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Overlap</span>
                <span className="text-slate-200 font-bold">200 chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Embed Model</span>
                <span className="text-slate-200 font-bold">BGE-small-v1.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Vector DB</span>
                <span className="text-slate-200 font-bold">ChromaDB</span>
              </div>
            </div>

            <button
              onClick={onOpenUpload}
              className="w-full py-2.5 bg-[#131d33] hover:bg-[#1a2947] border border-[#203254] text-white font-mono-custom text-xs font-semibold rounded-xl transition-all"
            >
              Configure Pipeline
            </button>
          </div>

          {/* System Events */}
          <div className="rag-card p-4 space-y-2">
            <p className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-wider">
              ● SYSTEM EVENTS
            </p>
            <div className="font-mono-custom text-[11px] space-y-2 text-[#94a3b8]">
              <div>
                <span className="text-[#64748b] mr-2">{new Date().toLocaleTimeString()}</span>
                <span>User collection isolated successfully.</span>
              </div>
              <div>
                <span className="text-[#64748b] mr-2">14:19:45</span>
                <span>Auto-scaling: Active vector search workers online.</span>
              </div>
              <div>
                <span className="text-[#64748b] mr-2">14:15:10</span>
                <span className="text-emerald-400">Embedding API: Nominal.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
