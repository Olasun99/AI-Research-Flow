import React, { useState, useRef, useEffect } from 'react';
import { Bot, PenTool, Sparkles, BookMarked, AlignLeft, ListOrdered, FileSearch, CheckCircle2, MoreHorizontal, MessageSquare, Plus, RefreshCcw, User, X, Search, Database, ListChecks } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isEvidence?: boolean;
}

export function WritingWorkspace() {
  const [content, setContent] = useState(`The rapid advancement of artificial intelligence in healthcare has introduced significant paradigm shifts in diagnostic procedures (Wang et al., 2022). Notably, machine learning models have demonstrated human-level accuracy in specific image recognition tasks, particularly in radiology and pathology. 

However, the integration of these systems into clinical workflows remains challenging due to regulatory hurdles, data privacy concerns, and the need for explainable AI architectures. Recent studies suggest that hybrid models, which combine deep learning with traditional rules-based expert systems, may offer a more robust solution for clinical decision support.

Future research must address the algorithmic bias present in training datasets to ensure equitable healthcare delivery across diverse populations (Smith & Jones, 2023).`);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'I am your Evidence-Grounded AI. Ask me to synthesize literature, extract claims, or draft paragraphs backed by verified sources.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationQuery, setCitationQuery] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const libraryReferences = [
    { id: 'ref1', author: 'Vaswani et al.', year: '2017', title: 'Attention is all you need' },
    { id: 'ref2', author: 'Devlin et al.', year: '2019', title: 'BERT: Pre-training of Deep Bidirectional Transformers' },
    { id: 'ref3', author: 'Brown et al.', year: '2020', title: 'Language Models are Few-Shot Learners' },
    { id: 'ref4', author: 'Goodfellow et al.', year: '2014', title: 'Generative Adversarial Nets' },
    { id: 'ref5', author: 'LeCun, Bengio, & Hinton', year: '2015', title: 'Deep learning' },
  ];

  const filteredReferences = libraryReferences.filter(r => 
    r.author.toLowerCase().includes(citationQuery.toLowerCase()) || 
    r.title.toLowerCase().includes(citationQuery.toLowerCase())
  );

  const insertCitation = (ref: typeof libraryReferences[0]) => {
    const citation = ` (${ref.author}, ${ref.year})`;
    
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + citation + content.substring(end);
      setContent(newContent);
      
      // Reset cursor position after React re-renders
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
        body: JSON.stringify({ query: userMessage.content, context: { documentContent: content } })
      });
      
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      const aiResponse: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: data.text,
        isEvidence: true
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Outline Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Document Outline</h3>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="text-sm font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors">1. Introduction</div>
          <div className="text-sm font-semibold text-slate-700 pl-4 cursor-pointer hover:text-indigo-600 transition-colors">1.1 Background</div>
          <div className="text-sm font-semibold text-slate-700 pl-4 border-l-2 border-indigo-500 text-indigo-700 cursor-pointer transition-colors">1.2 AI in Diagnostics</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">2. Methodology</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">3. Results</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">4. Discussion</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">5. Conclusion</div>
          <div className="text-sm font-bold text-slate-900 mt-4 cursor-pointer hover:text-indigo-600 transition-colors">References</div>
        </div>
      </div>

      {/* Main Editor Canvas */}
      <div className="flex-1 flex flex-col relative bg-slate-100/50">
        {/* Formatting Toolbar */}
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
             <button className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded hover:bg-emerald-100 transition-colors">
                <CheckCircle2 className="w-4 h-4" /> Check Grammar
             </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-sm border border-slate-200 min-h-[800px] p-12 focus-within:ring-2 ring-indigo-500 outline-none transition-shadow rounded">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 font-serif">1.2 AI in Diagnostics</h2>
            <textarea 
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none outline-none text-slate-800 text-lg leading-loose font-serif bg-transparent"
              spellCheck={false}
            />
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
                   <div className="text-sm font-bold text-slate-900">{ref.author} ({ref.year})</div>
                   <div className="text-xs font-medium text-slate-500 truncate">{ref.title}</div>
                 </div>
               ))}
               {filteredReferences.length === 0 && (
                 <div className="p-4 text-center text-sm font-medium text-slate-500">No matching references found.</div>
               )}
             </div>
          </div>
        )}
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 shadow-xl z-20">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-indigo-900 text-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <h3 className="text-sm font-bold tracking-tight">Evidence-Grounded AI</h3>
          </div>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-indigo-800 rounded"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
        
        <div className="p-4 flex flex-col gap-3 border-b border-slate-100 bg-slate-50">
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
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-slate-50 relative">
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
    </div>
  );
}
