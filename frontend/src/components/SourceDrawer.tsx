import React from 'react';
import { X, FileText, Bookmark, Target } from 'lucide-react';
import type { Citation } from '../types';

interface SourceDrawerProps {
  citations: Citation[] | null;
  onClose: () => void;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({
  citations,
  onClose,
}) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg h-full bg-[#060e20] border-l border-[#424754]/50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#424754]/40 flex items-center justify-between bg-[#131b2e]">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-[#4cd7f6]" />
            <div>
              <h3 className="font-headline text-base font-bold text-[#dae2fd]">
                Source Vector Context ({citations.length})
              </h3>
              <p className="text-[11px] text-[#c2c6d6]/70 font-mono-custom">
                Exact document chunks retrieved from ChromaDB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#c2c6d6] hover:text-white rounded-lg hover:bg-[#2d3449] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chunks List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {citations.map((cit, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-4 border-[#3b82f6]/30 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#424754]/40 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#adc6ff]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{cit.filename}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#3b82f6]/20 text-[#adc6ff] rounded text-[10px] font-mono-custom">
                  Page {cit.page} • Chunk #{cit.chunk_id}
                </span>
              </div>

              {cit.score !== undefined && cit.score > 0 && (
                <div className="flex items-center gap-2 text-[11px] text-[#4cd7f6] font-mono-custom">
                  <Target className="w-3.5 h-3.5" />
                  <span>Euclidean Distance Score: {cit.score.toFixed(4)}</span>
                </div>
              )}

              <div className="bg-[#0b1326] p-3.5 rounded-lg border border-[#424754]/40 font-mono-custom text-xs text-[#c2c6d6] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {cit.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
