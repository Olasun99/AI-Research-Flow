import React from 'react';
import { BookOpen, FileText, LayoutDashboard, Library, Settings, Sparkles, FolderKanban, GitMerge, PenTool, BookMarked, FileCheck2, BarChart2, BookType, FileSearch } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Reference Library', icon: Library },
    { id: 'literature', label: 'Literature Review', icon: GitMerge },
    { id: 'writing', label: 'Writing Workspace', icon: PenTool },
    { id: 'citation', label: 'Citation Manager', icon: BookMarked },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'validator', label: 'Citation Validator', icon: FileSearch },
    { id: 'submission', label: 'Export & Submission', icon: FileCheck2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#0A0A0A] h-screen flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6 border-b border-slate-800/50 bg-[#0A0A0A]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white font-serif">ResearchFlow</span>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-none mt-2">Write. Cite. Organize.</p>
      </div>

      <nav className="flex-1 px-2 py-6 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 px-4">Workspace</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all relative ${
                isActive 
                  ? 'text-white font-semibold bg-white/5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium'
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r" />}
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-[10px] font-bold text-indigo-400 mb-1.5 flex items-center gap-2 uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
             AI Assistant
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Ready to help you write. (Ctrl+K to command)</p>
        </div>
      </div>
    </div>
  );
}
