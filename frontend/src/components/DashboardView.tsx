import React from 'react';
import {
  Radio,
  Database,
  Share2,
  Zap,
  CloudCheck,
  ArrowRight,
  FileText,
  FileCode,
  Trash2,
  MessageSquare,
  Upload,
} from 'lucide-react';
import type { DocumentItem, SystemMetrics } from '../types';

interface DashboardViewProps {
  documents: DocumentItem[];
  metrics: SystemMetrics;
  onOpenUpload: () => void;
  onDeleteDocument: (docId: string) => void;
  onGoToChat: () => void;
  onGoToLibrary: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  metrics,
  onOpenUpload,
  onDeleteDocument,
  onGoToChat,
  onGoToLibrary,
}) => {
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks_count || 12), 0);
  const calculatedTokens = (totalChunks * 512).toLocaleString();

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'json' || ext === 'csv') return <FileCode className="w-4 h-4 text-slate-300" />;
    return <FileText className="w-4 h-4 text-slate-300" />;
  };

  return (
    <div className="space-y-6 pb-16 select-none">
      {/* SYSTEM OVERVIEW HEADER */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline-custom text-xl font-bold text-white flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-slate-100 animate-pulse" />
            <span>System Overview</span>
          </h3>
          <div className="px-3.5 py-1 bg-[#09152a] border border-[#1e3a5f] text-slate-200 rounded-full font-mono-custom text-xs flex items-center gap-2">
            <span className="w-2 h-2 bg-[#38bdf8] rounded-full animate-ping" />
            <span>Live Optimization Active</span>
          </div>
        </div>

        {/* 3 SYSTEM METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Vector Engine */}
          <div className="rag-card p-5 relative overflow-hidden group hover:border-[#334155] transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-widest">
                  VECTOR ENGINE
                </p>
                <h4 className="font-headline-custom text-xl font-bold text-white mt-0.5">
                  ChromaDB
                </h4>
              </div>
              <Database className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-headline-custom text-3xl font-bold text-white">
                  {metrics.chromaLatencyMs}
                </span>
                <span className="font-mono-custom text-xs text-[#64748b] ml-1.5">
                  ms latency
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#94a3b8] font-mono-custom text-[11px]">
                  {documents.length} docs indexed
                </span>
                <div className="w-20 h-1 bg-[#1a243a] rounded-full mt-1.5 overflow-hidden">
                  <div className="w-full h-full bg-slate-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Embedding Model */}
          <div className="rag-card p-5 relative overflow-hidden group hover:border-[#334155] transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-widest">
                  EMBEDDING MODEL
                </p>
                <h4 className="font-headline-custom text-xl font-bold text-white mt-0.5">
                  BGE-small
                </h4>
              </div>
              <Share2 className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-headline-custom text-3xl font-bold text-white">
                  {metrics.embeddingModelLatencyMs}
                </span>
                <span className="font-mono-custom text-xs text-[#64748b] ml-1.5">
                  ms infer
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#94a3b8] font-mono-custom text-[11px]">
                  384 dims
                </span>
                <div className="w-20 h-1 bg-[#1a243a] rounded-full mt-1.5 overflow-hidden">
                  <div className="w-[85%] h-full bg-slate-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Inference Speed */}
          <div className="rag-card p-5 relative overflow-hidden group hover:border-[#334155] transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-widest">
                  INFERENCE SPEED
                </p>
                <h4 className="font-headline-custom text-xl font-bold text-white mt-0.5">
                  API Throughput
                </h4>
              </div>
              <Zap className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-headline-custom text-3xl font-bold text-white">
                  {metrics.throughputReqMin}
                </span>
                <span className="font-mono-custom text-xs text-[#64748b] ml-1.5">
                  req/min
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-emerald-400 font-mono-custom text-[11px]">
                  ● Active
                </span>
                <div className="w-20 h-1 bg-[#1a243a] rounded-full mt-1.5 overflow-hidden">
                  <div className="w-full h-full bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO KNOWLEDGE OVERVIEW + CLOUD SYNC & MODEL CACHE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Knowledge Overview */}
        <div className="lg:col-span-8 rag-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-widest">
                BENTO KNOWLEDGE OVERVIEW
              </p>
              <h3 className="font-headline-custom text-2xl font-bold text-white mt-0.5">
                {calculatedTokens} Tokens Indexed
              </h3>
            </div>
            <span className="px-3 py-1 bg-[#09152a] border border-[#1e3a5f] text-slate-200 rounded-full font-mono-custom text-xs">
              {documents.length} Files Active
            </span>
          </div>

          {/* Histogram Chart with smooth spline curve overlay */}
          <div className="relative h-44 my-4 flex items-end justify-between gap-2 px-2">
            {/* SVG spline curve overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              preserveAspectRatio="none"
              viewBox="0 0 400 120"
            >
              <path
                d="M 10 90 Q 60 40, 120 70 T 240 30 T 360 65 T 390 20"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                opacity="0.9"
              />
              <circle cx="240" cy="30" r="5" fill="#ffffff" />
            </svg>

            {/* Bar columns */}
            {[35, 55, 40, 70, 85, 60, 95, 75, 50, 80, 65, 90, 45, 70, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  className="w-full bg-[#1e293b] group-hover:bg-[#334155] rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1a243a] text-xs font-mono-custom text-[#64748b]">
            <div className="flex items-center gap-4">
              <span>● Chunk Size: 1000</span>
              <span>● Overlap: 200</span>
              <span>● Top-K: 3</span>
            </div>
            <button
              onClick={onOpenUpload}
              className="text-slate-200 hover:text-white font-bold flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Side Bento Stack */}
        <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
          {/* Cloud Sync Card */}
          <div className="rag-card p-6 relative">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-widest">
                CLOUD SYNC
              </span>
              <CloudCheck className="w-5 h-5 text-slate-300" />
            </div>
            <p className="font-headline-custom text-xl font-bold text-white mb-1">
              Synced {metrics.cloudSyncTime}
            </p>
            <div className="flex items-center justify-between text-xs font-mono-custom text-[#94a3b8] mt-4">
              <span>Chroma Persistent Cache</span>
              <span className="text-slate-200 font-bold">100% OK</span>
            </div>
          </div>

          {/* Model Cache Card */}
          <div className="rag-card p-6 relative">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-widest">
                MODEL CACHE
              </span>
              <span className="text-xs font-mono-custom text-slate-200 bg-[#1e293b] px-2 py-0.5 rounded font-bold">
                GPU L1
              </span>
            </div>
            <p className="font-mono-custom text-xs text-[#64748b] mb-1">
              Vector Hit Ratio
            </p>
            <div className="flex items-end justify-between">
              <span className="font-headline-custom text-3xl font-bold text-white">
                {metrics.cacheHitRatioPercent}%
              </span>
              <span className="font-mono-custom text-xs text-[#94a3b8]">
                +1.2% pts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT DOCUMENTS TABLE */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline-custom text-lg font-bold text-white">
            Recent Documents ({documents.length})
          </h3>
          <button
            onClick={onGoToLibrary}
            className="text-slate-300 hover:text-white font-mono-custom text-xs flex items-center gap-1.5 hover:underline"
          >
            <span>View all index</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rag-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="font-mono-custom text-[10px] text-[#64748b] uppercase tracking-wider border-b border-[#1a243a] bg-[#070b14]">
                  <th className="py-3 px-6 font-normal">DOCUMENT NAME</th>
                  <th className="py-3 px-4 font-normal">TYPE</th>
                  <th className="py-3 px-4 font-normal">CHUNKS</th>
                  <th className="py-3 px-4 font-normal">SIZE</th>
                  <th className="py-3 px-4 font-normal">STATUS</th>
                  <th className="py-3 px-6 font-normal text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a243a] font-mono-custom text-xs">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748b]">
                      No documents ingested yet. Click <strong>Upload Document</strong> to index your first file.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => {
                    const ext = doc.filename.split('.').pop()?.toUpperCase() || 'PDF';
                    return (
                      <tr
                        key={doc.document_id}
                        className="hover:bg-[#0f172a]/60 transition-colors"
                      >
                        <td className="py-3.5 px-6 font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-[#1a243a] rounded border border-[#334155]">
                              {getFileIcon(doc.filename)}
                            </div>
                            <span>{doc.filename}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#94a3b8]">{ext}</td>
                        <td className="py-3.5 px-4 text-[#94a3b8]">
                          {doc.chunks_count || 12} chunks
                        </td>
                        <td className="py-3.5 px-4 text-[#94a3b8]">
                          {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : '128 KB'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-[#1e293b] text-slate-200 border border-[#334155] rounded text-[10px] font-bold">
                            READY
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => onDeleteDocument(doc.document_id)}
                            title="Delete document"
                            className="p-1 text-[#64748b] hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Floating Chat Bubble Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onGoToChat}
          className="w-13 h-13 p-3.5 bg-white text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative"
        >
          <MessageSquare className="w-6 h-6 fill-slate-950" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-mono-custom font-bold flex items-center justify-center rounded-full border-2 border-[#050811]">
            {documents.length}
          </span>
        </button>
      </div>
    </div>
  );
};
