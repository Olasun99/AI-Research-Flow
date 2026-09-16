import React, { useState } from 'react';
import { Search, Database, FileText, CheckCircle, ExternalLink, Plus, Loader2, BookMarked, ArrowRight } from 'lucide-react';

export function CitationManager() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchSource, setSearchSource] = useState('crossref');
  const [imported, setImported] = useState<string[]>([]);
  const [citationStyle, setCitationStyle] = useState('apa');

  const formatCitation = (result: any, style: string, type: 'in-text' | 'bibliography' | 'endnote') => {
    const authors = result.authors;
    const year = result.year;
    const title = result.title;
    const journal = result.journal;
    const doi = result.doi;
    const firstAuthorLast = authors.split(',')[0];

    if (style === 'apa') {
      if (type === 'in-text') return `(${firstAuthorLast} et al., ${year})`;
      if (type === 'bibliography') return `${authors} (${year}). ${title} <i>${journal}</i>. https://doi.org/${doi}`;
      if (type === 'endnote') return `1. ${firstAuthorLast} et al., "${title}" (${year}).`;
    } else if (style === 'mla') {
      if (type === 'in-text') return `(${firstAuthorLast} et al. 42)`;
      if (type === 'bibliography') return `${authors}. "${title}" <i>${journal}</i>, ${year}.`;
      if (type === 'endnote') return `1. ${firstAuthorLast} et al., "${title}"`;
    } else if (style === 'chicago') {
      if (type === 'in-text') return `(${firstAuthorLast} et al. ${year})`;
      if (type === 'bibliography') return `${authors}. "${title}" <i>${journal}</i> (${year}). https://doi.org/${doi}.`;
      if (type === 'endnote') return `1. ${authors}, "${title}," <i>${journal}</i> (${year}).`;
    } else if (style === 'harvard') {
      if (type === 'in-text') return `(${firstAuthorLast} et al., ${year})`;
      if (type === 'bibliography') return `${authors}, ${year}. ${title} <i>${journal}</i>. Available at: https://doi.org/${doi}.`;
      if (type === 'endnote') return `1. ${firstAuthorLast} et al., ${year}.`;
    }
    return '';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: '1',
          title: 'Deep learning for medical image analysis: a comprehensive review.',
          authors: 'Wang, J., et al.',
          year: 2022,
          journal: 'Medical Image Analysis',
          doi: '10.1016/j.media.2021.102322',
          type: 'Journal Article',
          citations: 452,
          abstract: 'Deep learning techniques have permeated nearly every aspect of medical image analysis. In this review, we cover the most recent progress in this rapidly growing field, surveying the application of deep learning to image classification, object detection, segmentation, registration, and other tasks.'
        },
        {
          id: '2',
          title: 'Machine learning in genomic medicine: a review of computational problems and data sets.',
          authors: 'Libbrecht, M. W., & Noble, W. S.',
          year: 2015,
          journal: 'Nature Reviews Genetics',
          doi: '10.1038/nrg3920',
          type: 'Journal Article',
          citations: 1250,
          abstract: 'Machine-learning methods have become essential for the analysis of high-throughput genomic data. Here, we review how machine learning is used to interpret genomic sequence, model chromatin organization and predict gene expression levels.'
        },
      ]);
      setIsSearching(false);
    }, 1500);
  };

  const handleImport = (id: string) => {
    setImported([...imported, id]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Citation Manager</h2>
           <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
             Query academic databases (Crossref, PubMed, Semantic Scholar) using DOIs, ISBNs, or PMIDs.
           </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 shrink-0">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <div className="flex flex-col gap-1 w-48 shrink-0">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Database</label>
               <select 
                 value={searchSource}
                 onChange={(e) => setSearchSource(e.target.value)}
                 className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                 <option value="crossref">Crossref API</option>
                 <option value="pubmed">PubMed (NCBI)</option>
                 <option value="semanticscholar">Semantic Scholar</option>
                 <option value="arxiv">arXiv</option>
               </select>
             </div>
             
             <div className="flex flex-col gap-1 flex-1">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Query (Title, DOI, PMID, ISBN)</label>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input 
                   type="text"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="e.g. 10.1038/nature14539 or 'Deep learning in genomics'"
                   className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
             </div>

             <div className="flex flex-col gap-1 shrink-0">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-0">Action</label>
               <button 
                 type="submit"
                 disabled={isSearching || !query.trim()}
                 className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[42px]"
               >
                 {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                 {isSearching ? 'Searching...' : 'Search'}
               </button>
             </div>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.length > 0 ? (
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
               <Database className="w-3.5 h-3.5" /> Found {results.length} results from {searchSource}
             </div>
             {results.map((result, idx) => {
               const isImported = imported.includes(result.id);
               return (
               <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 group">
                 <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{result.title}</h3>
                    <button 
                      onClick={() => handleImport(result.id)}
                      disabled={isImported}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors shrink-0 ml-4 ${
                        isImported 
                          ? 'bg-emerald-50 text-emerald-700 opacity-50 cursor-not-allowed' 
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800'
                      }`}
                    >
                      {isImported ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} 
                      {isImported ? 'Imported' : 'Import'}
                    </button>
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                    <span className="text-slate-800">{result.authors}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{result.year}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="italic">{result.journal}</span>
                 </div>

                 {result.abstract && (
                   <div className="text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed">
                     {result.abstract}
                   </div>
                 )}

                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                         {result.type}
                       </span>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                         {result.citations} Citations
                       </span>
                    </div>
                    {result.doi && (
                      <a href={`https://doi.org/${result.doi}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-700 hover:underline">
                        DOI: {result.doi} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                 </div>

                 {/* Format Preview */}
                 <div className="mt-2 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Formatting Previews</div>
                      <select 
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                        className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 outline-none"
                      >
                        <option value="apa">APA 7</option>
                        <option value="mla">MLA 9</option>
                        <option value="chicago">Chicago</option>
                        <option value="harvard">Harvard</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">In-Text Citation</span>
                          <span className="text-sm font-serif text-slate-700" dangerouslySetInnerHTML={{ __html: formatCitation(result, citationStyle, 'in-text') }}></span>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">Bibliography</span>
                          <span className="text-sm font-serif text-slate-700 break-words" dangerouslySetInnerHTML={{ __html: formatCitation(result, citationStyle, 'bibliography') }}></span>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">End Note</span>
                          <span className="text-sm font-serif text-slate-700" dangerouslySetInnerHTML={{ __html: formatCitation(result, citationStyle, 'endnote') }}></span>
                       </div>
                    </div>
                 </div>
               </div>
             )})}
          </div>
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-indigo-500">
                 <BookMarked className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No Results Yet</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                 Use the search bar above to query external databases for references, metadata, and citation counts.
              </p>
           </div>
        )}
      </div>
    </div>
  );
}
