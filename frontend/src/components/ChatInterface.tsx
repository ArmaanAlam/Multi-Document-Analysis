import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  FileText,
  Bot,
  User,
  Sparkles,
  BookOpen,
  HelpCircle,
  BarChart,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import type { ChatMessage, Citation } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isGenerating: boolean;
  onSelectCitation: (citations: Citation[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  onSelectCitation,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'Summarize Key Insights',
      query: 'What are the main findings and conclusions in the uploaded document?',
    },
    {
      icon: <BarChart className="w-4 h-4" />,
      title: 'Analyze Performance & Metrics',
      query: 'What numerical data, measurements, or statistics are reported?',
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      title: 'Explain Methodology',
      query: 'What approach or system architecture is introduced in this report?',
    },
  ];

  return (
    <div className="chat-container">
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="hero-empty">
            <div className="hero-badge">
              <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Portfolio-Grade RAG Architecture
            </div>
            <h2 className="hero-title">Ask anything about your document</h2>
            <p className="hero-subtitle">
              Upload a PDF report to retrieve vector embeddings, inspect source chunk citations, and generate answers powered by meta-llama/Llama-3.1-8B.
            </p>

            <div className="prompt-templates">
              {samplePrompts.map((p, idx) => (
                <div
                  key={idx}
                  className="template-card"
                  onClick={() => onSendMessage(p.query)}
                >
                  <div className="template-icon">{p.icon}</div>
                  <div className="template-title">{p.title}</div>
                  <div className="template-desc">{p.query}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.role}`}>
              <div className={`message-avatar ${msg.role}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="message-content-wrapper">
                <div className="message-header">
                  <span className="sender-name">
                    {msg.role === 'user' ? 'You' : 'NeuralRAG Assistant'}
                  </span>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>

                <div className="message-body">
                  {msg.role === 'assistant' ? (
                    <div style={{ position: 'relative' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="citations-list">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', width: '100%', marginBottom: 4 }}>
                            Retrieved Source Citations ({msg.citations.length}):
                          </span>
                          {msg.citations.map((c, i) => (
                            <div
                              key={i}
                              className="citation-pill"
                              onClick={() => onSelectCitation(msg.citations || [])}
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{c.filename} (Pg {c.page})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="btn btn-ghost"
                        style={{ position: 'absolute', top: 0, right: 0, padding: 4 }}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="message-bubble assistant">
            <div className="message-avatar assistant">
              <Bot className="w-4 h-4" />
            </div>
            <div className="message-content-wrapper">
              <div className="message-header">
                <span className="sender-name">NeuralRAG Assistant</span>
                <span className="timestamp">Thinking...</span>
              </div>
              <div className="message-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Search className="w-4 h-4 animate-spin text-cyan-400" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Searching Chroma DB & generating response...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-box">
          <textarea
            className="chat-textarea"
            placeholder="Ask a question about your uploaded PDF report... (Press Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="btn btn-primary"
            style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, justifyContent: 'center', flexShrink: 0 }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
