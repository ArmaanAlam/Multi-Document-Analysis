import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  Paperclip,
  Mic,
  FileText,
  Plus,
  Bot,
  User,
  Trash2,
  Bookmark,
} from 'lucide-react';
import type { ChatMessage, Citation } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isGenerating: boolean;
  onClearChat: () => void;
  onSelectCitation: (citations: Citation[]) => void;
  documentCount: number;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  onClearChat,
  onSelectCitation,
  documentCount,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative bg-[#050811] text-[#dae2fd] overflow-hidden select-none">
      {/* Sub Header */}
      <div className="px-8 py-3 bg-[#080d19] border-b border-[#151c2e] flex items-center justify-between z-10 font-mono-custom text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white font-headline-custom text-base">Intelligence</span>
          <span className="text-[#64748b]">|</span>
          <span className="text-[#94a3b8] flex items-center gap-1.5">
            🗄 INDEX: ENTERPRISE_Q4
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 text-[#64748b] hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Main 2-Column Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: SOURCES Sidebar */}
        <div className="w-[280px] bg-[#070b14] border-r border-[#151c2e] p-5 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono-custom text-xs">
              <span className="text-[#64748b] font-bold flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5" /> SOURCES
              </span>
              <span className="px-2 py-0.5 bg-[#141f36] border border-[#1f2f50] text-[#94a3b8] rounded text-[10px] font-bold">
                {documentCount} ACTIVE
              </span>
            </div>

            {/* Source Card 1 */}
            <div className="rag-card p-3.5 space-y-1 hover:border-[#3b82f6] transition-all cursor-pointer">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono-custom">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="truncate">Annual_Report_2023.pdf</span>
              </div>
              <p className="font-mono-custom text-[10px] text-[#64748b] pl-6">
                84 Pages • Standard
              </p>
            </div>

            {/* Source Card 2 */}
            <div className="rag-card p-3.5 space-y-1 hover:border-[#3b82f6] transition-all cursor-pointer">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono-custom">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="truncate">Technical_Specs_v2.docx</span>
              </div>
              <p className="font-mono-custom text-[10px] text-[#64748b] pl-6">
                12 Pages • Verified
              </p>
            </div>

            {/* Source Card 3 */}
            <div className="rag-card p-3.5 space-y-1 border-b-2 border-white hover:border-[#3b82f6] transition-all cursor-pointer">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs font-mono-custom">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="truncate">Market_Analysis_Q4.pdf</span>
              </div>
            </div>
          </div>

          <button className="w-full py-2.5 bg-[#090e1a] hover:bg-[#131d33] border border-[#1e293b] text-slate-300 font-mono-custom text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
            <Plus className="w-3.5 h-3.5" />
            <span>+ ATTACH SOURCE</span>
          </button>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden p-6">
          {/* Scroll Messages */}
          <div className="flex-1 overflow-y-auto pr-3 space-y-6 max-w-4xl mx-auto w-full">
            {messages.length === 0 ? (
              /* Screenshot 3 Default Session View */
              <div className="space-y-6 pt-4">
                <div className="text-center font-mono-custom text-xs text-[#64748b]">
                  <span className="px-4 py-1.5 bg-[#0e1628] border border-[#1a243a] rounded-md tracking-widest text-[#94a3b8]">
                    SESSION INITIALIZED: ALPHA PROTOCOL
                  </span>
                </div>

                {/* Simulated User Question Box */}
                <div className="flex flex-col items-end">
                  <div className="rag-card p-5 max-w-2xl text-xs font-mono-custom leading-relaxed text-slate-200 border-[#1e293b]">
                    Can you summarize the primary technical risks identified in the Q4 market analysis and cross-reference them with our current technical specifications for the RAG v2 system?
                  </div>
                  <span className="font-mono-custom text-[10px] text-[#64748b] mt-1.5">
                    TIMESTAMP: 10:24 AM
                  </span>
                </div>

                {/* System Response Box */}
                <div className="rag-card p-6 space-y-4 border-[#1e293b]">
                  <div className="flex items-center gap-2 font-mono-custom text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-slate-300" />
                    <span>❖ SYSTEM RESPONSE</span>
                  </div>

                  <div className="text-xs font-mono-custom text-slate-300 leading-relaxed space-y-3">
                    <p>
                      Analysis complete. I have identified three critical technical risks and their impact on the RAG v2.4 development roadmap:
                    </p>

                    <div className="pl-2 space-y-2">
                      <p>
                        <strong className="text-white">01.</strong> Latency bottlenecks in vector retrieval when scaling beyond 1M chunks. This directly conflicts with Section 4.2 of the technical specs.
                      </p>
                      <p>
                        <strong className="text-white">02.</strong> API rate limits for the embedding models cited in the Q4 Market Report as a potential cost-scaling risk.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1a243a] flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-[#64748b] uppercase">REFERENCE CITATIONS:</span>
                      <button className="px-3 py-1 bg-[#131d33] border border-[#1e2d4a] rounded text-[10px] text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Report_2023.pdf [p. 12]
                      </button>
                      <button className="px-3 py-1 bg-[#131d33] border border-[#1e2d4a] rounded text-[10px] text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Technical_Specs_v2.docx [p. 4]
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cross referencing indicator */}
                <div className="font-mono-custom text-[11px] text-[#64748b] flex items-center gap-2 px-4 py-2 bg-[#0a0f1d] border border-[#1a243a] rounded-lg max-w-fit">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-ping" />
                  <span>••• CROSS-REFERENCING DATASETS...</span>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rag-card p-5 max-w-2xl text-xs font-mono-custom leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#0e1628] border-[#1e2d4a] text-slate-100'
                          : 'bg-[#090e1a] border-[#1a243a] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-2 text-slate-300">
                        {msg.role === 'user' ? (
                          <User className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                        <span>{msg.role === 'user' ? 'USER QUERY' : '❖ SYSTEM RESPONSE'}</span>
                      </div>

                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="markdown-body text-xs font-mono-custom">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#1a243a] flex flex-wrap items-center gap-2">
                          <span className="text-[10px] text-[#64748b] uppercase">REFERENCE CITATIONS:</span>
                          {msg.citations.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => msg.citations && onSelectCitation(msg.citations)}
                              className="px-2.5 py-1 bg-[#131d33] hover:bg-[#1a2947] border border-[#1e2d4a] rounded text-[10px] text-slate-200 flex items-center gap-1.5"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{c.filename} [p. {c.page}]</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="font-mono-custom text-[11px] text-[#64748b] flex items-center gap-2 px-4 py-2 bg-[#0a0f1d] border border-[#1a243a] rounded-lg max-w-fit animate-pulse">
                <span className="w-2 h-2 bg-slate-200 rounded-full animate-ping" />
                <span>••• GENERATING SYSTEM ANALYSIS...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Input Workspace */}
          <div className="max-w-4xl mx-auto w-full pt-4 space-y-2">
            <form
              onSubmit={handleSubmit}
              className="rag-card p-2 border-[#1e293b] focus-within:border-[#3b82f6] flex items-center gap-3"
            >
              <button type="button" className="p-2 text-[#64748b] hover:text-white">
                <Paperclip className="w-4 h-4" />
              </button>

              <button type="button" className="p-2 text-[#64748b] hover:text-white">
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="ENTER QUERY FOR SYSTEM ANALYSIS..."
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono-custom text-slate-200 placeholder:text-[#475569] px-2 py-1.5"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isGenerating}
                className="p-2.5 bg-white text-slate-950 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-all font-bold"
              >
                <Send className="w-4 h-4 fill-slate-950" />
              </button>
            </form>

            <div className="flex items-center justify-between font-mono-custom text-[10px] text-[#64748b] px-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  RAG ENGINE ONLINE
                </span>
                <span>|</span>
                <span>MODEL: CLAUDE 3.5</span>
              </div>
              <div className="flex items-center gap-2">
                <span>CONTEXT ALLOCATION</span>
                <div className="w-16 h-1 bg-[#1a243a] rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-slate-300" />
                </div>
              </div>
            </div>

            <p className="font-mono-custom text-[10px] text-[#475569] text-center uppercase tracking-wider pt-1">
              SYSTEM-GENERATED CONTENT REQUIRES VERIFICATION AGAINST ORIGINAL SOURCE DOCUMENTS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
