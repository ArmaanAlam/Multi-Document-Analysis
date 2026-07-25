import React from 'react';
import {
  LayoutGrid,
  Archive,
  MessageSquare,
  Settings,
  Upload,
  Activity,
  HelpCircle,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'library' | 'chat' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  documentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenUpload,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      id: 'library' as NavTab,
      label: 'Knowledge Library',
      icon: Archive,
    },
    {
      id: 'chat' as NavTab,
      label: 'Chat Interface',
      icon: MessageSquare,
    },
    {
      id: 'settings' as NavTab,
      label: 'System Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-[260px] h-full fixed left-0 top-0 flex flex-col py-6 bg-[#04060d] border-r border-[#151c2e] z-50 select-none">
      {/* Brand Header */}
      <div className="px-6 mb-8">
        <h1 className="font-headline-custom text-xl font-black text-white tracking-tight">
          RAG Engine
        </h1>
        <p className="font-mono-custom text-[11px] text-[#64748b] tracking-wider mt-0.5">
          v2.4.0-Enterprise • ChromaDB
        </p>
      </div>

      {/* Primary Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-mono-custom font-semibold transition-all text-left ${
                isActive
                  ? 'text-white bg-[#0e1628] border-r-2 border-white'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#090d18]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Action Area */}
      <div className="px-4 mt-auto space-y-4">
        {/* Upload Document Solid White Button */}
        <button
          onClick={onOpenUpload}
          className="w-full py-3 bg-white hover:bg-slate-200 text-slate-950 font-mono-custom font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-lg active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>

        {/* Footer Navigation */}
        <div className="space-y-1 pt-2 border-t border-[#151c2e] text-xs font-mono-custom text-[#64748b]">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:text-slate-200 hover:bg-[#090d18] transition-colors text-left"
          >
            <Activity className="w-4 h-4 text-[#64748b]" />
            <span className="text-[11px]">System Health: Optimal</span>
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:text-slate-200 hover:bg-[#090d18] transition-colors text-left"
          >
            <HelpCircle className="w-4 h-4 text-[#64748b]" />
            <span className="text-[11px]">Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
