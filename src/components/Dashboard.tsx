import React, { useState } from 'react';
import { FileText, Database, AlertTriangle, FileUp, Sparkles, Plus, FolderOpen, PenTool, FolderKanban, UploadCloud, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const stats = [
    { label: 'References', value: '287', color: 'text-slate-900' },
    { label: 'Citations Used', value: '213', color: 'text-indigo-600' },
    { label: 'Duplicate Refs', value: '4', color: 'text-amber-600' },
    { label: 'Missing Refs', value: '3', color: 'text-rose-600' },
    { label: 'Format Errors', value: '12', color: 'text-amber-600' },
    { label: 'Plagiarism Risk', value: 'Low', color: 'text-emerald-600' },
    { label: 'Writing Progress', value: '76%', color: 'text-indigo-600' },
  ];

  const recentProjects = [
    { name: 'PhD Thesis - Chapter 3', type: 'Thesis', lastEdited: '2 hours ago', progress: 76 },
    { name: 'Machine Learning in Genomics', type: 'Journal Paper', lastEdited: 'Yesterday', progress: 45 },
    { name: 'CRISPR Applications 2025', type: 'Literature Review', lastEdited: '3 days ago', progress: 92 },
    { name: 'NIH Grant Proposal', type: 'Grant', lastEdited: '1 week ago', progress: 15 },
    { name: 'ICML Conference Paper', type: 'Conference', lastEdited: '2 weeks ago', progress: 100 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Welcome Banner & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col gap-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">ResearchFlow AI</h2>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            Your Complete AI-Powered Research Writing Workspace.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onViewChange('writing')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Project
          </button>
          <button onClick={() => onViewChange('writing')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <FolderOpen className="w-4 h-4" /> Open Thesis
          </button>
          <button onClick={() => onViewChange('writing')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" /> Open Manuscript
          </button>
          <button onClick={() => onViewChange('library')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <FileUp className="w-4 h-4" /> Import References
          </button>
          <button onClick={() => onViewChange('writing')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <PenTool className="w-4 h-4" /> Continue Writing
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center gap-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects & Import */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Recent Projects</h3>
              <button className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest hover:text-indigo-700">View all</button>
            </div>
            <div className="p-0">
              {recentProjects.map((project, i) => (
                <div key={i} onClick={() => onViewChange('writing')} className="px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4">
                  <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 shrink-0">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{project.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{project.type}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">{project.lastEdited}</span>
                    </div>
                  </div>
                  <div className="w-24 shrink-0 flex flex-col gap-1 items-end">
                     <span className="text-[10px] font-bold text-slate-500">{project.progress}%</span>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress}%` }} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Import Zone */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Quick Import</h3>
            </div>
            <div className="p-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  setUploadStatus('uploading');
                  setTimeout(() => setUploadStatus('success'), 2000);
                  setTimeout(() => setUploadStatus('idle'), 5000);
                }}
              >
                 {uploadStatus === 'idle' && (
                   <>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm mb-4 text-indigo-500">
                       <UploadCloud className="w-6 h-6" />
                     </div>
                     <h4 className="text-sm font-bold text-slate-900 mb-1">Drag & drop files here</h4>
                     <p className="text-xs text-slate-500 font-medium mb-4">Supports PDF, DOCX, RIS, BibTeX, and EndNote XML</p>
                     <label className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
                       Browse Files
                       <input 
                         type="file" 
                         className="hidden" 
                         onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                             setUploadStatus('uploading');
                             setTimeout(() => setUploadStatus('success'), 2000);
                             setTimeout(() => setUploadStatus('idle'), 5000);
                           }
                         }}
                       />
                     </label>
                   </>
                 )}
                 {uploadStatus === 'uploading' && (
                   <>
                     <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                       <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                     </div>
                     <h4 className="text-sm font-bold text-slate-900 mb-1">Ingesting References...</h4>
                     <p className="text-xs text-slate-500 font-medium">Extracting metadata using AI</p>
                   </>
                 )}
                 {uploadStatus === 'success' && (
                   <>
                     <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                       <CheckCircle2 className="w-6 h-6" />
                     </div>
                     <h4 className="text-sm font-bold text-slate-900 mb-1">Import Successful</h4>
                     <p className="text-xs text-slate-500 font-medium mb-3">References added to your library</p>
                     <button onClick={() => onViewChange('library')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                       View Library
                     </button>
                   </>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions / System Health */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">AI Insights</h3>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="p-5 space-y-4 flex-1">
             <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Duplicate Detected
                </h4>
                <p className="text-xs text-amber-700 font-medium">You have 4 duplicate references in your library. Would you like AI to merge them?</p>
                <button onClick={() => onViewChange('library')} className="mt-2 text-[10px] font-bold bg-white text-amber-700 border border-amber-200 px-2 py-1 rounded hover:bg-amber-100">Review Duplicates</button>
             </div>
             
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                <h4 className="text-[11px] font-bold text-indigo-800 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Missing Metadata
                </h4>
                <p className="text-xs text-indigo-700 font-medium">3 references are missing DOI or publication year. Auto-fetch now?</p>
                <button onClick={() => onViewChange('library')} className="mt-2 text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100">Fetch Metadata</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
