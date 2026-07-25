import React, { useState } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, AlertCircle, X } from 'lucide-react';
import { apiClient, type UserProfile } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await apiClient.login(email, password);
        onAuthSuccess(res.user);
      } else {
        const res = await apiClient.register(name, email, password);
        onAuthSuccess(res.user);
      }
      onClose();
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md rag-card p-8 space-y-6 relative border-[#1e293b] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748b] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center mx-auto text-slate-200 shadow-inner">
            {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h3 className="font-headline-custom text-xl font-bold text-white">
            {mode === 'login' ? 'Sign In to RAG Engine' : 'Create Intelligence Account'}
          </h3>
          <p className="font-mono-custom text-xs text-[#64748b]">
            Isolated ChromaDB vector storage per account
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-[#0a0f1d] p-1 rounded-xl border border-[#1e293b] font-mono-custom text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-950 font-bold shadow'
                : 'text-[#64748b] hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === 'register'
                ? 'bg-white text-slate-950 font-bold shadow'
                : 'text-[#64748b] hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-mono-custom text-xs text-[#64748b] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Vance"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono-custom text-slate-200 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono-custom text-xs text-[#64748b] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@enterprise.rag.ai"
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono-custom text-slate-200 focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono-custom text-xs text-[#64748b] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono-custom text-slate-200 focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono-custom flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-slate-200 text-slate-950 font-mono-custom font-bold rounded-xl text-xs transition-all shadow-lg active:scale-95 disabled:opacity-40"
          >
            {isLoading
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
