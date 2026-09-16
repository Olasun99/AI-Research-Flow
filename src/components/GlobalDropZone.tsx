import React, { useState, useEffect } from 'react';
import { FileUp, FileText, UploadCloud, CheckCircle2 } from 'lucide-react';

export function GlobalDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Ensure we only close if leaving the main window, not child elements
      if (e.clientX === 0 || e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setUploadStatus('uploading');
      setTimeout(() => setUploadStatus('success'), 2000);
      setTimeout(() => setUploadStatus('idle'), 5000);
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  if (!isDragging && uploadStatus === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm pointer-events-none transition-all">
      <div className="bg-white p-12 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 max-w-lg w-full">
        {isDragging && uploadStatus === 'idle' && (
          <>
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Drop files to import</h2>
            <p className="text-sm font-medium text-slate-500">
              Release to instantly ingest PDF, RIS, or BibTeX files into your library and automatically parse metadata.
            </p>
          </>
        )}
        {uploadStatus === 'uploading' && (
          <>
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Ingesting references...</h2>
            <p className="text-sm font-medium text-slate-500">
              Extracting metadata using AI parsing.
            </p>
          </>
        )}
        {uploadStatus === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Import Successful</h2>
            <p className="text-sm font-medium text-slate-500">
              Files have been added to your reference library.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
