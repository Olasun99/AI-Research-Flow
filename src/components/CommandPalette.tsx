import React, { useEffect, useState, useRef } from 'react';
import { Search, FileText, Library, GitMerge, PenTool, LayoutDashboard, Settings, FileSearch, CheckCircle2 } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Go to Library', icon: Library },
    { id: 'writing', label: 'Open Writing Workspace', icon: PenTool },
    { id: 'literature', label: 'Open Literature Review', icon: GitMerge },
    { id: 'validator', label: 'Run Citation Validator', icon: FileSearch },
    { id: 'settings', label: 'Open Settings', icon: Settings },
  ];

  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent text-slate-900 text-lg outline-none font-medium placeholder:text-slate-400"
          />
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded">ESC to close</div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggestions</div>
              {filteredCommands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <button 
                    key={cmd.id}
                    onClick={() => {
                      onNavigate(cmd.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="bg-slate-100 text-slate-500 p-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
