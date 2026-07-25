import React, { useState } from 'react';
import {
  User,
  RefreshCw,
  Trash2,
  ExternalLink,
  Upload,
  Key,
} from 'lucide-react';
import type { SystemConfig } from '../types';

interface SettingsViewProps {
  config: SystemConfig;
  onSaveConfig: (newConfig: SystemConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<SystemConfig>(config);
  const [advancedReasoning, setAdvancedReasoning] = useState(false);
  const [temperature, setTemperature] = useState(0.7);

  return (
    <div className="space-y-6 pb-16 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-custom text-2xl font-bold text-white">
            System Configuration
          </h2>
          <p className="font-mono-custom text-xs text-[#64748b] mt-0.5">
            Manage your architecture settings and knowledge base parameters.
          </p>
        </div>

        <button className="px-4 py-2 bg-[#0f172a] hover:bg-[#1a243a] border border-[#1e293b] text-slate-200 font-mono-custom text-xs font-semibold rounded-lg transition-all">
          Export Config
        </button>
      </div>

      {/* 2X2 BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: User Profile */}
        <div className="rag-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a243a] pb-3">
            <h3 className="font-headline-custom font-bold text-base text-white">
              User Profile
            </h3>
            <span className="px-2.5 py-0.5 bg-[#0e172a] border border-[#1e293b] text-[#94a3b8] rounded text-[10px] font-mono-custom font-bold">
              ENTERPRISE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#141e33] border border-[#1f2d4a] flex items-center justify-center text-slate-300">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-headline-custom text-lg font-bold text-white">
                Lead Architect
              </h4>
              <p className="font-mono-custom text-xs text-[#64748b]">
                architect@enterprise.rag.ai
              </p>
              <p className="font-mono-custom text-[10px] text-[#94a3b8] uppercase tracking-wider mt-1">
                SYSTEM AUTHORITY: LEVEL 9
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="py-2.5 bg-[#131d33] hover:bg-[#1a2947] border border-[#203254] text-white font-mono-custom text-xs font-semibold rounded-lg transition-all">
              Edit Details
            </button>
            <button className="py-2.5 bg-[#0f172a] hover:bg-[#1a243a] border border-[#1e293b] text-slate-300 font-mono-custom text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all">
              <Key className="w-3.5 h-3.5" /> API Keys
            </button>
          </div>
        </div>

        {/* Card 2: Database Management */}
        <div className="rag-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a243a] pb-3">
            <h3 className="font-headline-custom font-bold text-base text-white">
              Database Management
            </h3>
            <span className="font-mono-custom text-[11px] text-[#94a3b8] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              Indexed & Stable
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0f1d] rounded-xl border border-[#1e293b]">
              <p className="font-mono-custom text-[10px] text-[#64748b] uppercase">
                Total Vector Chunks
              </p>
              <p className="font-headline-custom text-2xl font-bold text-white mt-1">
                14,204,912
              </p>
            </div>
            <div className="p-4 bg-[#0a0f1d] rounded-xl border border-[#1e293b]">
              <p className="font-mono-custom text-[10px] text-[#64748b] uppercase">
                Index Latency
              </p>
              <p className="font-headline-custom text-2xl font-bold text-white mt-1">
                24ms
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 bg-[#131d33] hover:bg-[#1a2947] border border-[#203254] text-white font-mono-custom text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Re-index Library
            </button>
            <button className="py-2.5 bg-[#0f172a] hover:bg-rose-950/40 border border-[#1e293b] text-slate-300 hover:text-rose-400 font-mono-custom text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Clear Vector Store
            </button>
          </div>
        </div>

        {/* Card 3: Model Settings */}
        <div className="rag-card p-6 space-y-5">
          <h3 className="font-headline-custom font-bold text-base text-white border-b border-[#1a243a] pb-3">
            Model Settings
          </h3>

          {/* Toggle */}
          <div className="p-4 bg-[#0a0f1d] rounded-xl border border-[#1e293b] flex items-center justify-between">
            <div>
              <p className="font-headline-custom text-sm font-bold text-white">
                Advanced Reasoning Mode
              </p>
              <p className="font-mono-custom text-[11px] text-[#64748b] mt-0.5">
                Enable multi-step inference chains for complex technical queries. Increases latency by ~15%.
              </p>
            </div>
            <button
              onClick={() => setAdvancedReasoning(!advancedReasoning)}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                advancedReasoning ? 'bg-white' : 'bg-[#1e293b]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  advancedReasoning ? 'bg-slate-950 translate-x-6' : 'bg-[#64748b]'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 font-mono-custom text-xs">
            <div>
              <label className="block text-[#64748b] mb-1.5">Retrieval Chunk Size</label>
              <select
                value={formData.chunkSize}
                onChange={(e) => {
                  const newCfg = { ...formData, chunkSize: parseInt(e.target.value) };
                  setFormData(newCfg);
                  onSaveConfig(newCfg);
                }}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg py-2.5 px-3 text-slate-200 outline-none"
              >
                <option value="512">512 tokens (Balanced)</option>
                <option value="1000">1000 tokens (Standard)</option>
                <option value="2000">2000 tokens (Large Context)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[#64748b] mb-1.5">
                <span>Temperature</span>
                <span className="text-slate-200 font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Card 4: About System */}
        <div className="rag-card p-6 flex flex-col justify-between space-y-5">
          <h3 className="font-headline-custom font-bold text-base text-white border-b border-[#1a243a] pb-3">
            About System
          </h3>

          <div className="space-y-3 font-mono-custom text-xs">
            <div className="flex justify-between py-1 border-b border-[#1a243a]/50">
              <span className="text-[#64748b]">ENGINE VERSION</span>
              <span className="text-slate-200">v1.5.2-stable</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1a243a]/50">
              <span className="text-[#64748b]">EMBEDDING MODEL</span>
              <span className="text-slate-200">Titan-V3-Large</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1a243a]/50">
              <span className="text-[#64748b]">UPTIME</span>
              <span className="text-slate-200">99.98%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748b]">COMPUTE TIER</span>
              <span className="text-slate-200">A100-80GB-Multi</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button className="w-full py-2.5 bg-[#0d1424] hover:bg-[#151f33] border border-[#1e293b] text-slate-300 font-mono-custom text-xs rounded-lg flex items-center justify-between px-4 transition-all">
              <span>View Documentation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button className="w-full py-2.5 bg-[#0d1424] hover:bg-[#151f33] border border-[#1e293b] text-slate-300 font-mono-custom text-xs rounded-lg flex items-center justify-between px-4 transition-all">
              <span>Release Notes</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DASHED BOTTOM ZONE: ADD NEW KNOWLEDGE SOURCES */}
      <div className="rag-card p-8 border-2 border-dashed border-[#1e2d4a] hover:border-slate-300 transition-all text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#11192e] border border-[#1e2d4a] flex items-center justify-center text-slate-200">
          <Upload className="w-5 h-5" />
        </div>
        <h4 className="font-headline-custom text-lg font-bold text-white">
          Add New Knowledge Sources
        </h4>
        <p className="font-mono-custom text-xs text-[#64748b]">
          Drag and drop PDFs, Markdown, or JSON files to begin indexing.
        </p>
        <span className="px-4 py-1.5 bg-[#0a0f1d] border border-[#1a243a] rounded-full font-mono-custom text-[11px] text-[#94a3b8]">
          Supported: .pdf, .docx, .md, .txt
        </span>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-col sm:flex-row items-center justify-between font-mono-custom text-[11px] text-[#64748b] pt-6 border-t border-[#151c2e] gap-3">
        <div>© 2024 Cognitive Architecture Labs</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Security Protocol
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-[#94a3b8]">
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <span>System Status: Nominal</span>
        </div>
      </footer>
    </div>
  );
};
