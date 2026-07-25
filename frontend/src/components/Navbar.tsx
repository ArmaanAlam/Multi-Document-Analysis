import React from 'react';
import { Search, Database, Cpu, Bell, LogIn, LogOut } from 'lucide-react';
import type { UserProfile } from '../api/client';

interface NavbarProps {
  title?: string;
  isOnline: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'RAG Intelligence',
  isOnline,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="w-full h-16 px-8 sticky top-0 z-40 bg-[#050811]/90 backdrop-blur-md border-b border-[#151c2e] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-6">
        <h2 className="font-headline-custom text-xl font-bold text-white tracking-tight">
          {title}
        </h2>

        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search vector store..."
            className="w-full bg-[#0d1424] border border-[#1e293b] rounded-full py-1.5 pl-10 pr-4 text-xs font-mono-custom text-slate-200 focus:outline-none focus:border-[#3b82f6] transition-all placeholder:text-[#475569]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Online status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#0d1424] border border-[#1e293b] rounded-full text-[11px] font-mono-custom">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline
                ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] animate-pulse'
                : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
            }`}
          />
          <span className="text-[#94a3b8]">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Database Icon */}
        <button
          title="Vector Store Active"
          className="p-2 text-[#94a3b8] hover:text-white hover:bg-[#0f172a] rounded-lg transition-colors"
        >
          <Database className="w-4.5 h-4.5" />
        </button>

        {/* Inference CPU Icon */}
        <button
          title="Inference Engine Active"
          className="p-2 text-[#94a3b8] hover:text-white hover:bg-[#0f172a] rounded-lg transition-colors"
        >
          <Cpu className="w-4.5 h-4.5" />
        </button>

        {/* Bell Notifications Icon with red dot badge */}
        <button
          title="Notifications"
          className="p-2 text-[#94a3b8] hover:text-white hover:bg-[#0f172a] rounded-lg transition-colors relative"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-[#1e293b] mx-1" />

        {/* User Auth Pill */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-slate-100 font-bold text-xs font-mono-custom">
                {getInitials(currentUser.name)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-mono-custom font-bold text-slate-200">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-mono-custom text-[#64748b]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 text-[#64748b] hover:text-rose-400 hover:bg-[#0f172a] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-950 rounded-lg text-xs font-mono-custom font-bold hover:bg-slate-200 transition-all shadow"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
