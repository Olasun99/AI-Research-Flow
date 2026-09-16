import React, { useState } from 'react';
import { Sun, Moon, Layout, CheckCircle2, Box } from 'lucide-react';

export function SettingsPanel() {
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState('geometric');

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-8 overflow-y-auto">
      <div>
         <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Settings</h2>
         <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
           Manage your workspace preferences, visual themes, and structural profiles for a distraction-free writing environment.
         </p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Appearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
               onClick={() => setTheme('light')}
               className={`p-5 rounded-xl border text-left flex items-start gap-4 transition-all ${theme === 'light' ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
             >
                <div className={`p-2 rounded-lg shrink-0 ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400'}`}>
                   <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900">Academic Light</h4>
                      {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                   </div>
                   <p className="text-xs font-medium text-slate-500 leading-relaxed">Clean, high-contrast interface designed for daytime research and drafting.</p>
                </div>
             </button>

             <button 
               onClick={() => setTheme('dark')}
               className={`p-5 rounded-xl border text-left flex items-start gap-4 transition-all ${theme === 'dark' ? 'bg-slate-900 border-indigo-500 shadow-sm ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
             >
                <div className={`p-2 rounded-lg shrink-0 ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-50 text-slate-400'}`}>
                   <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Focus Dark</h4>
                      {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                   </div>
                   <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Low-glare environment optimized for deep work and late-night editing sessions.</p>
                </div>
             </button>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 mt-4">Visual Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
               onClick={() => setProfile('geometric')}
               className={`p-5 rounded-xl border text-left flex items-start gap-4 transition-all ${profile === 'geometric' ? 'bg-indigo-50/50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
             >
                <div className="p-2 rounded-lg shrink-0 bg-white border border-slate-200 text-slate-600">
                   <Box className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900">Geometric Balance</h4>
                      {profile === 'geometric' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                   </div>
                   <p className="text-xs font-medium text-slate-500 leading-relaxed">Structured spacing, clean typography, and mathematical precision in layout alignment.</p>
                </div>
             </button>

             <button 
               onClick={() => setProfile('compact')}
               className={`p-5 rounded-xl border text-left flex items-start gap-4 transition-all ${profile === 'compact' ? 'bg-indigo-50/50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
             >
                <div className="p-2 rounded-lg shrink-0 bg-white border border-slate-200 text-slate-600">
                   <Layout className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900">Information Dense</h4>
                      {profile === 'compact' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                   </div>
                   <p className="text-xs font-medium text-slate-500 leading-relaxed">Compact spacing to maximize the number of visible references and data points.</p>
                </div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
