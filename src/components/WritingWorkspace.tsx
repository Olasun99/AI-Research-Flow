import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bot, BookMarked, AlignLeft, ListOrdered, FileSearch, CheckCircle2, MoreHorizontal, MessageSquare, X, Search, Database, ListChecks, Download, Plus, Library, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isEvidence?: boolean;
}

interface CitationMeta {
  id: string;
  full_authors: string;
  first_author: string;
  year: string;
  title: string;
  journal: string;
  doi: string;
  status: string;
  original?: string;
}

const STYLES = ["APA 7th", "Vancouver", "IEEE", "Harvard", "MLA 9th", "Chicago"];

function formatIntext(ref: CitationMeta, style: string, number: number) {
  if (["APA 7th", "Harvard", "Chicago"].includes(style)) {
    return `(${ref.first_author}, ${ref.year})`;
  } else if (["Vancouver", "IEEE"].includes(style)) {
    return `[${number}]`;
  } else {
    return `(${ref.first_author})`;
  }
}

function formatBib(ref: CitationMeta, style: string, number: number) {
  const { full_authors: a, year: y, title: t, journal: j, doi } = ref;
  if (style === "APA 7th") return `${a} (${y}). ${t}. ${j}. ${doi ? 'https://doi.org/'+doi : ''}`;
  if (style === "Harvard") return `${a} ${y}, '${t}', ${j}.`;
  if (style === "Vancouver") return `${number}. ${a}. ${t}. ${j}. ${y}; ${doi ? 'doi:'+doi : ''}`;
  if (style === "IEEE") return `[${number}] ${a}, "${t}," ${j}, ${y}.`;
  if (style === "MLA 9th") return `${a}. "${t}." ${j}, ${y}.`;
  if (style === "Chicago") return `${a}. ${y}. "${t}." ${j}.`;
  return "";
}

async function fetchMetadata(query: string): Promise<CitationMeta> {
  try {
    const res = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=1&mailto=hello@example.com`);
    const data = await res.json();
    const item = data.message.items[0];
    const authorsList = item.author || [];
    const firstAuthor = authorsList.length > 0 ? (authorsList[0].family || 'Unknown') : 'Unknown';
    const year = item.published?.['date-parts']?.[0]?.[0] || '2024';
    
    return {
      id: `${firstAuthor}${year}`.replace(/[^a-zA-Z0-9]/g, ''),
      full_authors: authorsList.map((a: any) => `${a.family}, ${a.given}`).join('; '),
      first_author: firstAuthor,
      year: String(year),
      title: item.title?.[0] || query,
      journal: item['container-title']?.[0] || '',
      doi: item.DOI || '',
      status: 'Verified'
    };
  } catch (err) {
    return {
      id: `Unknown${new Date().getFullYear()}`,
      full_authors: 'Unknown',
      first_author: 'Unknown',
      year: String(new Date().getFullYear()),
      title: query,
      journal: '',
      doi: '',
      status: 'Unverified'
    };
  }
}

export function WritingWorkspace() {
  const [content, setContent] = useState(`The rapid advancement of artificial intelligence in healthcare has introduced significant paradigm shifts in diagnostic procedures @Wang2022. Notably, machine learning models have demonstrated human-level accuracy in specific image recognition tasks, particularly in radiology and pathology.\n\nHowever, the integration of these systems into clinical workflows remains challenging due to regulatory hurdles, data privacy concerns, and the need for explainable AI architectures. Recent studies suggest that hybrid models, which combine deep learning with traditional rules-based expert systems, may offer a more robust solution for clinical decision support.\n\nFuture research must address the algorithmic bias present in training datasets to ensure equitable healthcare delivery across diverse populations @Smith2023.`);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'I am your Evidence-Grounded AI. Ask me to synthesize literature, extract claims, or draft paragraphs backed by verified sources.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationQuery, setCitationQuery] = useState('');
  
  const [library, setLibrary] = useState<CitationMeta[]>([
     {
        id: 'Wang2022', full_authors: 'Wang, S.; Li, X.', first_author: 'Wang', year: '2022',
        title: 'Deep learning in medical image analysis', journal: 'Medical Image Analysis', doi: '10.1016/j.media.2022.102659', status: 'Verified'
     },
     {
        id: 'Smith2023', full_authors: 'Smith, J.; Jones, M.', first_author: 'Smith', year: '2023',
        title: 'Algorithmic bias in healthcare AI', journal: 'Nature Medicine', doi: '10.1038/s41591-023-02200-5', status: 'Verified'
     }
  ]);
  const [bibStyle, setBibStyle] = useState(STYLES[0]);
  const [rawRefs, setRawRefs] = useState('');
  const [isAddingRefs, setIsAddingRefs] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'copilot' | 'library'>('library');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredReferences = library.filter(r => 
    r.full_authors.toLowerCase().includes(citationQuery.toLowerCase()) || 
    r.title.toLowerCase().includes(citationQuery.toLowerCase())
  );

  const insertCitation = (ref: CitationMeta) => {
    const citation = ` @${ref.id} `;
    
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + citation + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + citation.length;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(prev => prev + citation);
    }
    
    setShowCitationModal(false);
    setCitationQuery('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: data.reply || 'I processed that request.',
        isEvidence: data.isEvidence 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLibrary = async () => {
     if (!rawRefs.trim()) return;
     setIsAddingRefs(true);
     const lines = rawRefs.split("\n").map(l => l.trim()).filter(l => l.length > 0);
     const newRefs: CitationMeta[] = [];
     for (const line of lines) {
        const meta = await fetchMetadata(line);
        meta.original = line;
        
        // Prevent duplicates
        const exists = library.some(m => (m.doi && m.doi === meta.doi) || (m.title === meta.title));
        if (!exists) {
           newRefs.push(meta);
        }
     }
     if (newRefs.length > 0) {
        setLibrary(prev => [...prev, ...newRefs]);
     }
     setRawRefs('');
     setIsAddingRefs(false);
  };

  const downloadDocument = () => {
     const element = document.createElement("a");
     const file = new Blob([`${renderedText}\n\nREFERENCES\n\n${fullBibText}`], {type: 'text/plain'});
     element.href = URL.createObjectURL(file);
     element.download = "manuscript_with_bib.txt";
     document.body.appendChild(element);
     element.click();
     document.body.removeChild(element);
  };

  // --- Rendering Pipeline ---
  const { renderedText, citedOrder, fullBibText } = useMemo(() => {
     let text = content;
     const foundCites = text.match(/@\w+\d{4}/g) || [];
     const cOrder: CitationMeta[] = [];
     
     // Find sequence
     for (const c of foundCites) {
         const id = c.substring(1); // remove @
         const ref = library.find(r => r.id === id);
         if (ref && !cOrder.find(r => r.id === id)) {
             cOrder.push(ref);
         }
     }

     // Replace text
     cOrder.forEach((ref, idx) => {
         const num = idx + 1;
         const regex = new RegExp(`@${ref.id}`, 'g');
         text = text.replace(regex, formatIntext(ref, bibStyle, num));
     });

     // Build Bib
     let finalBibList = cOrder;
     if (!["Vancouver", "IEEE"].includes(bibStyle)) {
         finalBibList = [...cOrder].sort((a, b) => a.first_author.localeCompare(b.first_author));
     }

     const fullBibText = finalBibList.map((ref, idx) => {
         const num = ["Vancouver", "IEEE"].includes(bibStyle) ? cOrder.findIndex(r => r.id === ref.id) + 1 : idx + 1;
         return `${num}. ${formatBib(ref, bibStyle, num)}`;
     }).join("\n\n");

     return { renderedText: text, citedOrder: cOrder, fullBibText, finalBibList };
  }, [content, library, bibStyle]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 relative overflow-hidden">
      {/* Sidebar - Outline (Left) */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Document Structure</h3>
          <p className="text-lg font-bold text-slate-900 font-serif">Research Manuscript</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-sm font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors">1. Introduction</div>
          <div className="pl-4 mt-2 flex flex-col gap-2 border-l-2 border-indigo-100 ml-1">
            <div className="text-xs font-medium text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors">1.1 Background</div>
            <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 -ml-[2px] border-l-2 border-indigo-600 cursor-pointer">1.2 AI in Diagnostics</div>
            <div className="text-xs font-medium text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors">1.3 Problem Statement</div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">2. Methodology</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">3. Results</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">4. Discussion</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">5. Conclusion</div>
        </div>
      </div>

      {/* Main Editor Canvas */}
      <div className="flex-1 flex flex-col relative bg-slate-100/50">
        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-1">
             <select className="text-sm font-semibold text-slate-700 border border-slate-200 rounded px-2 py-1 bg-slate-50">
                <option>Heading 2</option>
                <option>Normal Text</option>
             </select>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1 text-slate-600">
             <button className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center font-bold font-serif">B</button>
             <button className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center italic font-serif">I</button>
             <button className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center underline font-serif">U</button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1 text-slate-600">
             <button className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center"><AlignLeft className="w-4 h-4" /></button>
             <button className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center"><ListOrdered className="w-4 h-4" /></button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowCitationModal(true)}
               className="flex items-center gap-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors"
             >
                <BookMarked className="w-4 h-4" /> Cite
             </button>
             <button onClick={downloadDocument} className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" /> Export
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-6 items-center">
          <div className="w-full max-w-4xl bg-white shadow-sm border border-slate-200 p-8 lg:p-12 focus-within:ring-2 ring-indigo-500 outline-none transition-shadow rounded relative">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 font-serif">1.2 AI in Diagnostics</h2>
            <textarea 
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[300px] text-lg text-slate-800 leading-relaxed resize-none focus:outline-none font-serif placeholder-slate-300"
              placeholder="Start writing... Type @ to insert a citation."
            />
            
            <div className="mt-8 pt-8 border-t border-slate-200">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Live Preview (Formatted)</h3>
               <div className="text-lg text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                  {renderedText}
               </div>
            </div>

            {fullBibText && (
               <div className="mt-12 pt-8 border-t border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif">References</h3>
                  <div className="text-sm text-slate-700 leading-loose whitespace-pre-wrap">
                     {fullBibText}
                  </div>
               </div>
            )}
          </div>
        </div>
                
        {/* Citation Modal */}
        {showCitationModal && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><BookMarked className="w-4 h-4 text-indigo-600" /> Insert Citation</h3>
                <button onClick={() => setShowCitationModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
             </div>
             <div className="p-4 border-b border-slate-100">
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   autoFocus
                   value={citationQuery}
                   onChange={(e) => setCitationQuery(e.target.value)}
                   placeholder="Search library by author or title..."
                   className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
             </div>
             <div className="max-h-[300px] overflow-y-auto p-2">
               {filteredReferences.map(ref => (
                 <div 
                   key={ref.id} 
                   onClick={() => insertCitation(ref)}
                   className="p-3 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-indigo-100 flex flex-col gap-1"
                 >
                   <div className="text-sm font-bold text-slate-900">@{ref.id}</div>
                   <div className="text-xs font-medium text-slate-500 line-clamp-2">{ref.title}</div>
                 </div>
               ))}
               {filteredReferences.length === 0 && (
                 <div className="p-4 text-center text-sm font-medium text-slate-500">No matching references found.</div>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[350px] border-l border-slate-200 bg-white flex flex-col shrink-0 shadow-xl z-20">
         <div className="flex bg-slate-50 border-b border-slate-200">
            <button 
               onClick={() => setSidebarTab('library')}
               className={`flex-1 py-3 text-sm font-bold border-b-2 flex justify-center items-center gap-2 transition-colors ${sidebarTab === 'library' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               <Library className="w-4 h-4" /> Library
            </button>
            <button 
               onClick={() => setSidebarTab('copilot')}
               className={`flex-1 py-3 text-sm font-bold border-b-2 flex justify-center items-center gap-2 transition-colors ${sidebarTab === 'copilot' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               <Bot className="w-4 h-4" /> AI Copilot
            </button>
         </div>

         {sidebarTab === 'library' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Citation Style</span>
                  </div>
                  <select 
                     value={bibStyle} 
                     onChange={(e) => setBibStyle(e.target.value)}
                     className="w-full text-sm font-bold text-slate-800 border border-slate-200 rounded-lg p-2 focus:ring-2 ring-indigo-500 outline-none"
                  >
                     {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               
               <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Add to Library</h4>
                  <textarea 
                     value={rawRefs}
                     onChange={(e) => setRawRefs(e.target.value)}
                     placeholder="Paste DOIs or titles (one per line)..."
                     className="w-full h-24 text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none resize-none"
                  />
                  <button 
                     onClick={handleAddLibrary}
                     disabled={isAddingRefs || !rawRefs.trim()}
                     className="bg-indigo-600 text-white w-full py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     {isAddingRefs ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Plus className="w-4 h-4" />}
                     Import References
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">My References ({library.length})</div>
                  {library.map(ref => (
                     <div key={ref.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-1 relative group">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">@{ref.id}</span>
                           <button onClick={() => navigator.clipboard.writeText(`@${ref.id}`)} className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">COPY</button>
                        </div>
                        <div className="text-sm font-bold text-slate-800 leading-tight mt-1">{ref.title}</div>
                        <div className="text-xs text-slate-500">{ref.first_author} ({ref.year})</div>
                     </div>
                  ))}
               </div>
            </div>
         ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
               <div className="p-4 flex flex-col gap-3 border-b border-slate-100 bg-slate-50 shrink-0">
                  <button className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 hover:shadow transition-all text-left">
                     <ListChecks className="w-5 h-5 text-indigo-600 shrink-0" />
                     <div>
                     <div className="text-sm font-bold text-slate-800">Generate from Claims</div>
                     <div className="text-xs text-slate-500 mt-0.5">Synthesize text from verified library</div>
                     </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 hover:shadow transition-all text-left">
                     <FileSearch className="w-5 h-5 text-indigo-600 shrink-0" />
                     <div>
                     <div className="text-sm font-bold text-slate-800">Query Literature</div>
                     <div className="text-xs text-slate-500 mt-0.5">Search verified scholarly DBs</div>
                     </div>
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        msg.role === 'assistant' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                     }`}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                     </div>
                     <div className={`p-3 rounded-lg text-sm leading-relaxed font-medium flex-1 ${
                        msg.role === 'user' ? 'bg-indigo-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
                     }`}>
                        {msg.content}
                        {msg.isEvidence && (
                        <div className="mt-3 flex gap-2">
                           <button className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified Evidence</button>
                           <button className="text-[10px] font-bold uppercase tracking-widest bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-50" onClick={() => setContent(prev => prev + '\n\n' + msg.content)}>Insert</button>
                        </div>
                        )}
                     </div>
                  </div>
                  ))}
                  {isLoading && (
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                     </div>
                     <div className="bg-slate-50 border border-slate-100 shadow-sm rounded-lg p-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                     </div>
                  </div>
                  )}
                  <div ref={messagesEndRef} />
               </div>
               
               <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-slate-50 relative shrink-0">
                  <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI to write or research..." 
                  className="w-full bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm"
                  />
                  <button type="submit" disabled={isLoading} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                     <MessageSquare className="w-5 h-5" />
                  </button>
               </form>
            </div>
         )}
      </div>
    </div>
  );
}
