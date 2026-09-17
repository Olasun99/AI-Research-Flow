import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Database, Fingerprint, BookOpen, FileCheck, CheckCircle2, AlertCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function CitationValidator() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeLevel, setActiveLevel] = useState<number>(0);
  const [documentText, setDocumentText] = useState('Smoking causes ischemic stroke. Hydrosalpinx decreases pregnancy rates by 50%. Deep learning models have demonstrated human-level accuracy in specific image recognition tasks.');
  const [verifiedClaims, setVerifiedClaims] = useState<any[]>([]);

  const verificationLevels = [
    { id: 1, title: 'Extract Claims', desc: 'Parses text to atomic claims' },
    { id: 2, title: 'Query Generation', desc: 'Builds PubMed/OpenAlex queries' },
    { id: 3, title: 'Source Retrieval', desc: 'Fetches scholarly metadata' },
    { id: 4, title: 'Evidence Extraction', desc: 'Pulls abstract snippets' },
    { id: 5, title: 'Claim-Evidence Match', desc: 'LLM compares claim to source' },
    { id: 6, title: 'Result Normalization', desc: 'Formats VERIFIED/CONTRADICTED states' },
  ];

  const startScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setVerifiedClaims([]);
    setActiveLevel(1);
    
    try {
       const interval = setInterval(() => {
          setActiveLevel(prev => (prev < 6 ? prev + 1 : prev));
       }, 1000);

       const res = await fetch('/api/claims/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: documentText })
       });

       clearInterval(interval);
       setActiveLevel(6);

       if (res.ok) {
          const data = await res.json();
          setVerifiedClaims(data.results || []);
       } else {
          console.error("Failed to verify");
       }
    } catch (e) {
       console.error(e);
    } finally {
       setIsScanning(false);
       setScanComplete(true);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'SUPPORTED') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === 'PARTIALLY_SUPPORTED') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    if (status === 'CONTRADICTED') return <XCircle className="w-4 h-4 text-rose-600" />;
    return <AlertCircle className="w-4 h-4 text-slate-400" />;
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 ";
    if (status === 'SUPPORTED') return base + "bg-emerald-100 text-emerald-700";
    if (status === 'PARTIALLY_SUPPORTED') return base + "bg-amber-100 text-amber-700";
    if (status === 'CONTRADICTED') return base + "bg-rose-100 text-rose-700";
    return base + "bg-slate-100 text-slate-700";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-indigo-600" /> Evidence & Citation Verification Engine
           </h2>
           <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
             Multi-level verification pipeline. Checks bibliographic metadata, DOI validity, citation-to-claim correspondence, and numerical claims.
           </p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning || !documentText.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
          {isScanning ? 'Running Verification Pipeline...' : (scanComplete ? 'Re-run Verification' : 'Verify Document Claims')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-4">
         <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste document text or paragraphs here..."
            className="w-full h-24 p-4 text-sm border border-slate-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none resize-none"
         />
        <div className="grid grid-cols-6 gap-2">
          {verificationLevels.map(level => (
            <div key={level.id} className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors ${
              activeLevel === level.id ? 'bg-indigo-50 border-indigo-200 shadow-inner' :
              activeLevel > level.id || scanComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-transparent opacity-50'
            }`}>
              <div className={`mb-2 w-8 h-8 rounded-full flex items-center justify-center ${
                activeLevel === level.id ? 'bg-indigo-100 text-indigo-600' :
                activeLevel > level.id || scanComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
              }`}>
                {activeLevel === level.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 activeLevel > level.id || scanComplete ? <CheckCircle2 className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">{level.title}</span>
            </div>
          ))}
        </div>
      </div>

      {scanComplete && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Evidence Audit Table</h3>
              <div className="flex gap-4">
                 <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Supported</span>
                 <span className="text-xs font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Partial</span>
                 <span className="text-xs font-bold text-rose-700 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Contradicted/Unverified</span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Extracted Claim</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Retrieved Source</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evidence/Reasoning</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedClaims.map((claim, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-4 align-top w-1/4">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">{claim.claim}</p>
                      </td>
                      <td className="p-4 align-top w-1/4">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            {claim.topSource ? (
                               <>
                                  <div className="text-sm font-bold text-slate-700 leading-snug">{claim.topSource.title}</div>
                                  <div className="text-xs text-slate-500 mt-1">{claim.topSource.authors} ({claim.topSource.year})</div>
                                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                                    <span className="font-bold text-indigo-500 mr-2">[{claim.topSource.sourceDatabase}]</span>
                                    {claim.topSource.pmid && <span>PMID: {claim.topSource.pmid} </span>}
                                    {claim.topSource.doi && <span>DOI: {claim.topSource.doi}</span>}
                                  </div>
                               </>
                            ) : (
                               <div className="text-sm text-slate-500 italic">No exact scholarly source found.</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top w-1/3">
                        <div className="flex items-start gap-2">
                           {getStatusIcon(claim.status)}
                           <div>
                              <div className="text-sm text-slate-700 italic">"{claim.evidence?.evidenceLocation || 'N/A'}"</div>
                              <div className="text-xs font-medium text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                                 {claim.evidence?.reasoning || claim.message}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className={getStatusBadge(claim.status)}>
                          {claim.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {verifiedClaims.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-sm text-slate-500">No claims extracted or verified.</td>
                     </tr>
                  )}
                </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
}

