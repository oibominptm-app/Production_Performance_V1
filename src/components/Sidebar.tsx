import React from 'react';
import { 
  LayoutGrid, 
  TrendingDown, 
  TrendingUp, 
  Link, 
  Database, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import { ViewTab, ConnectionState } from '../types';

interface SidebarProps {
  currentView: ViewTab;
  onViewChange: (view: ViewTab) => void;
  onToggleConnect: () => void;
  onLoadDemo: () => void;
  onOpenExport: () => void;
  onSync: () => void;
  connection: ConnectionState;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onToggleConnect,
  onLoadDemo,
  onOpenExport,
  onSync,
  connection
}: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 bg-[#0D0D0F] border-r border-white/10 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand logo header with elegant gradient block */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#C4A661] to-[#8E793E] rounded flex items-center justify-center text-black font-semibold font-mono text-sm leading-none shrink-0">
          PTM
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wider uppercase text-white/40 leading-none">
            PTM Agriculture
          </div>
          <div className="text-[14px] font-serif tracking-wide font-medium text-[#C4A661] mt-1 leading-tight">
            Production System
          </div>
        </div>
      </div>

      {/* Main sidebar navigation */}
      <nav className="p-4 flex-1 flex flex-col gap-1">
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-2 py-1 mt-2">
          ภาพรวม
        </div>
        
        <button
          onClick={() => onViewChange('overview')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-left w-full ${
            currentView === 'overview'
              ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/30'
              : 'text-white/60 hover:bg-[#181c26] hover:text-[#e8eaf2] border border-transparent'
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span>ภาพรวม</span>
        </button>

        <button
          onClick={() => onViewChange('loss')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-left w-full ${
            currentView === 'loss'
              ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/30'
              : 'text-white/60 hover:bg-[#181c26] hover:text-[#e8eaf2] border border-transparent'
          }`}
        >
          <TrendingDown className="w-4 h-4 shrink-0" />
          <span>เวลาสูญเสีย</span>
        </button>

        <button
          onClick={() => onViewChange('production')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-left w-full ${
            currentView === 'production'
              ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/30'
              : 'text-[#d1d1d1]/80 hover:bg-[#181c26] hover:text-[#e8eaf2] border border-transparent'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>การผลิต</span>
        </button>

        <div className="text-[10px] font-bold tracking-widest uppercase text-white/30 px-2 py-1 mt-4">
          ข้อมูล
        </div>

        <button
          onClick={onToggleConnect}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-white/60 hover:bg-[#181c26] hover:text-[#e8eaf2] border border-transparent text-left w-full"
        >
          <Link className="w-4 h-4 shrink-0 text-[#C4A661]" />
          <span>เชื่อมต่อข้อมูล</span>
        </button>

        <button
          onClick={onLoadDemo}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-white/60 hover:bg-[#181c26] hover:text-[#e8eaf2] border border-transparent text-left w-full"
        >
          <Database className="w-4 h-4 shrink-0 text-[#C4A661]/70" />
          <span>โหลดข้อมูลตัวอย่าง</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-[#C4A661] hover:bg-[#C4A661]/5 border border-transparent text-left w-full"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>ส่งออกข้อมูล</span>
        </button>
      </nav>

      {/* Bottom update/sync actions */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onSync}
          disabled={connection === 'loading'}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors text-[#C4A661] hover:bg-[#C4A661]/10 border border-transparent text-left w-full disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${connection === 'loading' ? 'animate-spin' : ''}`} />
          <span>ซิงค์ข้อมูล</span>
        </button>
      </div>
    </aside>
  );
}
