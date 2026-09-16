import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import type { AnalyzedReference, CitationStyle } from '../types';

export function Analyzer() {
  const [inputText, setInputText] = useState('');
  const [targetStyle, setTargetStyle] = useState<CitationStyle>('APA 7');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzedReference | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/references/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetStyle })
      });
      
      if (!response.ok) throw new Error('Failed to analyze reference');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)] overflow-y-auto">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Input Reference</h3>
        <p className="text-sm text-slate-500">Paste any messy, incomplete, or incorrectly formatted reference. The AI will identify the type, fetch missing metadata, and correct the format.</p>
        
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. smith j (2020) the nature of AI. journal of machine learning. 10(2) 100-120. doi:..."
          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Target Style:</span>
            <select 
              value={targetStyle}
              onChange={(e) => setTargetStyle(e.target.value as CitationStyle)}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="APA 7">APA 7th Edition</option>
              <option value="MLA">MLA 9th Edition</option>
              <option value="Chicago">Chicago Manual of Style</option>
              <option value="Harvard">Harvard</option>
              <option value="Vancouver">Vancouver</option>
              <option value="IEEE">IEEE</option>
            </select>
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><SparklesIcon className="w-4 h-4" /> Validate & Convert</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Analysis Results */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">AI Diagnostics</h3>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Detected Source Type</span>
                  <span className="text-sm font-semibold text-slate-800">{result.sourceType}</span>
               </div>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Detected Original Style</span>
                  <span className="text-sm font-semibold text-slate-800">{result.detectedStyle}</span>
               </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Issues Identified
                </h4>
                <ul className="space-y-2">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-sm font-semibold text-slate-700 flex items-start gap-2 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                 <CheckCircle className="w-4 h-4 text-emerald-500" /> Extracted Metadata
              </h4>
              <div className="space-y-2 text-sm">
                 <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 border-b border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authors:</span>
                    <span className="text-slate-800 font-semibold">{result.metadata?.authors?.join(', ') || 'N/A'}</span>
                 </div>
                 <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 border-b border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Title:</span>
                    <span className="text-slate-800 font-semibold">{result.metadata?.title || 'N/A'}</span>
                 </div>
                 <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 border-b border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Year:</span>
                    <span className="text-slate-800 font-semibold">{result.metadata?.year || 'N/A'}</span>
                 </div>
                 <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 border-b border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Publication:</span>
                    <span className="text-slate-800 font-semibold">{result.metadata?.publication || 'N/A'}</span>
                 </div>
                 <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 border-b border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">DOI:</span>
                    <span className="text-indigo-600 font-mono font-medium hover:underline cursor-pointer">{result.metadata?.doi || 'N/A'}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Formatted Output */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">Formatted Reference ({targetStyle})</h3>
            
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-slate-800 text-sm leading-relaxed relative group font-serif">
              {result.formattedReference}
              <button 
                onClick={() => navigator.clipboard.writeText(result.formattedReference)}
                className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Copy to clipboard"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">AI Explanation</h4>
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               </div>
               <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                 {result.explanation}
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      <path d="M20 3v4"/>
      <path d="M22 5h-4"/>
      <path d="M4 17v2"/>
      <path d="M5 18H3"/>
    </svg>
  )
}
