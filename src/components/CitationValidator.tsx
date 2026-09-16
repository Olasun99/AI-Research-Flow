import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Database, Fingerprint, BookOpen, FileCheck, CheckCircle2, AlertCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function CitationValidator() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeLevel, setActiveLevel] = useState<number>(0);

  const verificationLevels = [
    { id: 1, title: 'Existence', desc: 'Checks Crossref/PubMed' },
    { id: 2, title: 'Metadata', desc: 'Validates Authors, Title, Year' },
    { id: 3, title: 'Claim/Evidence', desc: 'Verifies source supports claim' },
    { id: 4, title: 'Numerical', desc: 'Validates exact statistics' },
    { id: 5, title: 'DOI Match', desc: 'Verifies the DOI resolution' },
    { id: 6, title: 'Retraction', desc: 'Checks for retractions/errata' },
  ];

  const claims = [
    {
      id: 1,
      claim: "Deep learning models have demonstrated human-level accuracy in specific image recognition tasks.",
      citation: "Vaswani et al., 2017",
      doi: "10.5555/3295222.3295349",
      evidenceFound: true,
      status: 'verified',
    },
    {
      id: 2,
      claim: "Hydrosalpinx decreases pregnancy rates by 50%.",
      citation: "Mohiyiddeen et al., 2015",
      doi: "10.1002/14651858.CD003718",
      evidenceFound: true,
      status: 'partial',
      problem: "The cited paper discusses reduced pregnancy rates but does not support the specific 50% estimate."
    },
    {
      id: 3,
      claim: "Tubal-factor infertility accounts for approximately 30% of female infertility cases.",
      citation: "Smith et al., 2023",
      doi: "10.1016/invalid.doi",
      evidenceFound: false,
      status: 'unsupported',
      problem: "Paper does not exist or DOI is invalid (Type A: Bibliographic Hallucination)."
    }
  ];

  const startScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setActiveLevel(1);
    
    let currentLevel = 1;
    const interval = setInterval(() => {
      currentLevel++;
      if (currentLevel <= 6) {
        setActiveLevel(currentLevel);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
        }, 500);
      }
    }, 800);
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
          disabled={isScanning}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
          {isScanning ? 'Running Verification Pipeline...' : (scanComplete ? 'Re-run Verification' : 'Verify Document Claims')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
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
                 <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 1 Verified</span>
                 <span className="text-xs font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> 1 Partial</span>
                 <span className="text-xs font-bold text-rose-700 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> 1 Unsupported</span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claim</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Citation</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">DOI</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evidence</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">{claim.claim}</p>
                        {claim.problem && (
                          <div className="mt-2 text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {claim.problem}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-slate-700">{claim.citation}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{claim.doi}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${claim.evidenceFound ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {claim.evidenceFound ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-4">
                        {claim.status === 'verified' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>}
                        {claim.status === 'partial' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertTriangle className="w-3.5 h-3.5" /> Partial</span>}
                        {claim.status === 'unsupported' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><XCircle className="w-3.5 h-3.5" /> Unsupported</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      )}
      
      {!scanComplete && !isScanning && (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
           <div className="text-center">
             <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p className="text-sm font-bold">Ready to verify document claims</p>
             <p className="text-xs font-medium mt-1">Click the verify button to begin the 6-stage audit</p>
           </div>
        </div>
      )}
    </div>
  );
}

