import React, { useState } from 'react';
import { GitMerge, Search, Plus, Filter, BookOpen, MoreVertical, FileText, CheckCircle2, ChevronRight, Sparkles, Loader2 } from 'lucide-react';

export function LiteratureReview() {
  const [activeTheme, setActiveTheme] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  const [themes] = useState([
    {
      id: 1,
      name: 'Diagnostic Accuracy',
      papersCount: 18,
      read: 15,
      summary: 'Deep learning models consistently match or outperform human radiologists in specific tasks, particularly in detecting lung nodules and mammography screening.',
      gap: 'Most studies are retrospective and lack prospective clinical validation across diverse hospital systems.'
    },
    {
      id: 2,
      name: 'Algorithmic Bias',
      papersCount: 12,
      read: 8,
      summary: 'Significant demographic bias exists in training datasets, leading to disparate diagnostic performance across ethnic and socioeconomic groups.',
      gap: 'Few papers propose actionable frameworks for federated learning to mitigate these data imbalances.'
    },
    {
      id: 3,
      name: 'Clinical Workflow Integration',
      papersCount: 7,
      read: 2,
      summary: 'Adoption is hindered by alert fatigue, lack of explainability (black-box models), and integration issues with legacy EHR systems.',
      gap: 'Qualitative research on physician trust and interaction with AI interfaces is highly limited.'
    }
  ]);

  const activeThemeData = themes.find(t => t.id === activeTheme) || themes[0];

  const generateSynthesis = async () => {
    setIsGenerating(true);
    setSynthesis(null);
    try {
      const prompt = `Synthesize the literature based on the following theme:\nTheme: ${activeThemeData.name}\nSummary: ${activeThemeData.summary}\nGap: ${activeThemeData.gap}\nPapers: ${activeThemeData.papersCount}\nPlease write a short, academic paragraph synthesizing this information.`;
      
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt })
      });
      const data = await res.json();
      setSynthesis(data.text);
    } catch (err) {
      console.error(err);
      setSynthesis("Failed to generate synthesis. Please ensure the backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Literature Review Builder</h2>
           <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
             Organize references by themes, track reading progress, and generate AI syntheses to identify research gaps.
           </p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateSynthesis} disabled={isGenerating} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Generate Full Synthesis'}
          </button>
        </div>
      </div>

      {synthesis && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl relative animate-in fade-in slide-in-from-top-4">
          <button onClick={() => setSynthesis(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">×</button>
          <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Generated Synthesis
          </h4>
          <p className="text-sm font-medium text-indigo-900 leading-relaxed">{synthesis}</p>
        </div>
      )}

      <div className="flex gap-6 h-full min-h-0">
        {/* Themes Sidebar */}
        <div className="w-80 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
           <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Research Themes</h3>
             <button className="text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"><Plus className="w-4 h-4" /></button>
           </div>
           <div className="p-3">
             <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search themes..." 
                 className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
               />
             </div>
           </div>
           <div className="flex-1 overflow-y-auto">
             {themes.map((theme) => {
               const isActive = theme.id === activeTheme;
               return (
                 <div key={theme.id} onClick={() => setActiveTheme(theme.id)} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex flex-col gap-2 ${isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-600' : 'hover:bg-slate-50'}`}>
                   <div className="flex justify-between items-start">
                     <h4 className={`text-sm font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{theme.name}</h4>
                     <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{theme.papersCount} papers</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {theme.read} Read
                      <span className="text-slate-300">•</span>
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" /> {theme.papersCount - theme.read} Unread
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

        {/* Theme Details Workspace */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                <span>Themes</span> <ChevronRight className="w-3 h-3" /> <span className="text-indigo-600">{activeThemeData.name}</span>
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">{activeThemeData.name}</h2>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group">
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={generateSynthesis} className="text-slate-400 hover:text-indigo-600"><Sparkles className="w-4 h-4" /></button>
                   </div>
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <FileText className="w-3.5 h-3.5" /> AI Thematic Summary
                   </h4>
                   <p className="text-sm font-medium text-slate-700 leading-relaxed">{activeThemeData.summary}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200/50 shadow-sm relative group">
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={generateSynthesis} className="text-amber-400 hover:text-amber-700"><Sparkles className="w-4 h-4" /></button>
                   </div>
                   <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <GitMerge className="w-3.5 h-3.5" /> Identified Research Gap
                   </h4>
                   <p className="text-sm font-medium text-amber-900 leading-relaxed">{activeThemeData.gap}</p>
                </div>
             </div>
          </div>

          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
             <h3 className="text-sm font-bold text-slate-800">Assigned References ({activeThemeData.papersCount})</h3>
             <div className="flex gap-2">
                <button className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-slate-200">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
                <button className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-indigo-100">
                  <Plus className="w-3.5 h-3.5" /> Add Ref
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            {/* Reference List */}
            <div className="divide-y divide-slate-100">
               {[
                 { author: 'Wang et al.', year: 2022, title: 'Deep learning for medical image analysis: a comprehensive review.', status: 'read', notes: 'Key paper. Demonstrates CNN superiority in detecting pulmonary nodules.' },
                 { author: 'Esteva et al.', year: 2017, title: 'Dermatologist-level classification of skin cancer with deep neural networks.', status: 'read', notes: 'Classic benchmark study. Retrospective only.' },
                 { author: 'McKinney et al.', year: 2020, title: 'International evaluation of an AI system for breast cancer screening.', status: 'unread', notes: '' },
               ].map((ref, i) => (
                 <div key={i} className="p-5 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                         {ref.status === 'read' ? (
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                         ) : (
                           <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                         )}
                         <span className="text-sm font-bold text-slate-900">{ref.author} ({ref.year})</span>
                       </div>
                       <button className="text-slate-400 hover:text-slate-700"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm font-medium text-slate-600 pl-7 max-w-3xl mb-3">{ref.title}</p>
                    
                    {ref.notes ? (
                      <div className="ml-7 bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex items-start gap-2">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-indigo-800">{ref.notes}</p>
                      </div>
                    ) : (
                      <div className="ml-7">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add notes
                        </button>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
