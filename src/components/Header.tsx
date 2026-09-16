import React from 'react';
import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search (Ctrl+K to command)..." 
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-none text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 w-72 transition-all font-medium"
          />
        </div>
        
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-none border border-white"></span>
        </button>
        
        <div className="w-8 h-8 rounded-none bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 text-xs">
          JD
        </div>
      </div>
    </header>
  );
}
