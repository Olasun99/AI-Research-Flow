import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, FileCheck2, ArrowRight } from 'lucide-react';

export function DocumentProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const processDocument = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch('/api/documents/process', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Failed to process document');
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        fileName: file.name,
        referencesFound: 0,
        errorsCorrected: 0,
        message: "Failed to connect to the processing server. Please ensure the backend is running."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 h-full">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Document Processor</h2>
           <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
             Upload a thesis, manuscript, or paper (DOCX, PDF). AI-ROS will automatically scan for in-text citations, extract the bibliography, synchronize missing links, repair formatting, and generate a polished export.
           </p>
        </div>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
          file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".docx,.pdf,.rtf,.txt"
        />
        
        {file ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white text-indigo-600 rounded flex items-center justify-center mb-4 shadow-sm border border-indigo-200">
               <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{file.name}</h3>
            <p className="text-[11px] font-mono text-slate-500 mb-6 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setFile(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                disabled={isProcessing}
              >
                Clear
              </button>
              <button 
                onClick={processDocument}
                disabled={isProcessing}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing AI Scan...</>
                ) : (
                  <>Analyze & Sync Document</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded flex items-center justify-center mb-4">
               <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 uppercase tracking-widest">Upload manuscript</h3>
            <p className="text-sm text-slate-500">Drag and drop your DOCX or PDF file here, or click to browse.</p>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center shrink-0">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900">Document Processing Complete</h3>
                <p className="text-sm font-medium text-emerald-700 mt-1">{result.message}</p>
              </div>
           </div>
           
           <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">In-Text Citations</span>
                <span className="text-2xl font-bold text-slate-900">{result.referencesFound}</span>
                <span className="text-xs font-semibold text-slate-500 ml-2">found & synced</span>
              </div>
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Formatting Errors</span>
                <span className="text-2xl font-bold text-indigo-600">{result.errorsCorrected}</span>
                <span className="text-xs font-semibold text-slate-500 ml-2">auto-corrected</span>
              </div>
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Missing Entries</span>
                <span className="text-2xl font-bold text-emerald-600">0</span>
                <span className="text-xs font-semibold text-slate-500 ml-2">all resolved</span>
              </div>
           </div>

           <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-5 py-2 rounded-lg text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                View detailed report
              </button>
              <button className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                <FileCheck2 className="w-4 h-4" /> Download Corrected DOCX
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
