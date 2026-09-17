import React, { useState } from 'react';
import { Database, FileText, CheckCircle, Search, Download, Clipboard, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export function CitationManager() {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [targetStyle, setTargetStyle] = useState('apa');
  const [formattedOutput, setFormattedOutput] = useState<{bibliography: string, inTextMap: any[]}>({ bibliography: '', inTextMap: [] });

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      // Very basic split by newline. In reality we'd use Gemini to extract individual references if messy.
      const rawRefs = inputText.split('\n').filter(r => r.trim().length > 10);
      
      const res = await fetch('/api/citations/verify-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: rawRefs })
      });
      
      const data = await res.json();
      setResults(data.results || []);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to process references.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormat = async () => {
    setIsProcessing(true);
    try {
      const validMeta = results.filter(r => r.status === 'Verified' && r.metadata).map(r => r.metadata);
      
      const res = await fetch('/api/citations/format-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadataList: validMeta, style: targetStyle })
      });
      
      const data = await res.json();
      setFormattedOutput(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Failed to format references.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutput.bibliography);
    alert('Copied to clipboard!');
  };

  const handleExport = (format: string) => {
    // Generate blob and download
    let content = formattedOutput.bibliography;
    let mime = 'text/plain';
    let ext = 'txt';

    if (format === 'bibtex' && targetStyle === 'bibtex') {
       ext = 'bib';
    } else if (format === 'ris' && targetStyle === 'ris') {
       ext = 'ris';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `references.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-6">
      <div className="flex justify-between items-end shrink-0">
        <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Bibliography Manager Engine</h2>
           <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
             Paste raw references, DOIs, or PMIDs. Auto-verify against Crossref/OpenAlex, correct metadata, and output a perfect bibliography.
           </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-4 shrink-0 overflow-x-auto pb-2">
         {[
           { num: 1, label: 'Input References' },
           { num: 2, label: 'Verification & Edit' },
           { num: 3, label: 'Format & Export' }
         ].map((s) => (
           <React.Fragment key={s.num}>
             <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${step === s.num ? 'bg-indigo-600 text-white shadow-md' : step > s.num ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
               <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{s.num}</span>
               {s.label}
             </div>
             {s.num < 3 && <div className={`w-8 h-px ${step > s.num ? 'bg-indigo-300' : 'bg-slate-200'}`} />}
           </React.Fragment>
         ))}
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4 flex-1">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              Paste Raw References, DOIs, or PMIDs (One per line)
            </label>
            <textarea
              className="flex-1 w-full border border-slate-200 rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              placeholder={`10.1038/s41586-020-2649-2\nVaswani, A., et al. (2017). Attention is all you need...\nSmith J. Deep learning in healthcare. J Med. 2021...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                onClick={handleProcess}
                disabled={isProcessing || !inputText.trim()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Auto-Verify References
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Verification Table */}
      {step === 2 && (
        <div className="flex flex-col gap-4 flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
               <CheckCircle className="w-4 h-4 text-emerald-500" /> Verification Results
             </h3>
             <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-slate-500">
                  {results.filter(r => r.status === 'Verified').length} / {results.length} Verified
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <select 
                  value={targetStyle} 
                  onChange={e => setTargetStyle(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg text-sm px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="apa">APA 7th Edition</option>
                  <option value="mla">MLA 9th Edition</option>
                  <option value="chicago">Chicago (Author-Date)</option>
                  <option value="vancouver">Vancouver</option>
                  <option value="harvard">Harvard</option>
                  <option value="ieee">IEEE</option>
                  <option value="bibtex">BibTeX</option>
                  <option value="ris">RIS Format</option>
                </select>
                <button 
                  onClick={handleFormat}
                  disabled={isProcessing}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  Format Bibliography
                </button>
             </div>
          </div>
          
          <div className="overflow-auto flex-1 p-0">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th className="px-6 py-3">Status</th>
                   <th className="px-6 py-3">Source</th>
                   <th className="px-6 py-3">Original Input</th>
                   <th className="px-6 py-3 w-full">Resolved Metadata (Title / Authors / Year)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {results.map((res, idx) => (
                   <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-4">
                       {res.status === 'Verified' ? (
                         <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-bold border border-emerald-200">
                           <CheckCircle className="w-3 h-3" /> Verified
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                           <AlertCircle className="w-3 h-3" /> Unverified
                         </span>
                       )}
                     </td>
                     <td className="px-6 py-4 font-semibold text-slate-600">{res.source}</td>
                     <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate font-mono text-xs" title={res.originalText}>
                       {res.originalText}
                     </td>
                     <td className="px-6 py-4">
                       {res.metadata ? (
                         <div className="flex flex-col gap-0.5 whitespace-normal min-w-[300px]">
                           <span className="font-bold text-slate-900">{res.metadata.title}</span>
                           <span className="text-slate-500 text-xs">{res.metadata.authors} ({res.metadata.year}) - <i>{res.metadata.journal}</i></span>
                           {res.metadata.doi && <span className="text-indigo-600 text-[10px] font-mono mt-1">DOI: {res.metadata.doi}</span>}
                         </div>
                       ) : (
                         <span className="text-slate-400 italic">No metadata resolved. Please edit manually.</span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
             <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700 text-sm font-bold">← Back to Input</button>
          </div>
        </div>
      )}

      {/* Step 3: Export */}
      {step === 3 && (
        <div className="flex flex-col gap-4 flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
               <FileText className="w-4 h-4 text-indigo-500" /> Formatted Output ({targetStyle.toUpperCase()})
             </h3>
             <div className="flex items-center gap-2">
               <button 
                 onClick={handleCopy}
                 className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2"
               >
                 <Clipboard className="w-4 h-4" /> Copy
               </button>
               <button 
                 onClick={() => handleExport('txt')}
                 className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2"
               >
                 <Download className="w-4 h-4" /> Download
               </button>
             </div>
          </div>
          
          <div className="overflow-auto flex-1 p-6">
             <div className="prose prose-sm max-w-none prose-slate">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-inner min-h-full" dangerouslySetInnerHTML={{__html: formattedOutput.bibliography || 'No formatted data.'}} />
             </div>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
             <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 text-sm font-bold">← Back to Edit</button>
             <button onClick={() => {setStep(1); setInputText(''); setResults([]);}} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold">Start New Batch</button>
          </div>
        </div>
      )}

    </div>
  );
}
