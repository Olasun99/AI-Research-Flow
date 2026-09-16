import React, { useState, useRef, useEffect } from 'react';
import { Filter, MoreHorizontal, Download, Plus, Search, Folder, ChevronDown, CheckSquare, FileText, ExternalLink, Bookmark, Hash, Edit3, Copy, Trash2, Upload, AlertTriangle, FileCheck2, Loader2, FileUp, GripVertical, RefreshCw, BookMarked, Database } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export function Library() {
  const [selected, setSelected] = useState<number[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchStep, setBatchStep] = useState<'uploading' | 'processing' | 'conflicts' | 'done'>('uploading');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('custom');
  const [importedFileName, setImportedFileName] = useState('');

  const [references, setReferences] = useState([
    { id: 1, author: 'Vaswani et al.', year: '2017', title: 'Attention is all you need', publication: 'NeurIPS', type: 'Conference Paper', citations: 12450, doi: '10.5555/3295222.3295349', tags: ['Deep Learning', 'NLP', 'Transformers'], hasPdf: true, collection: 'all', isComplete: true },
    { id: 2, author: 'Devlin et al.', year: '2019', title: 'BERT: Pre-training of Deep Bidirectional Transformers', publication: 'NAACL', type: 'Conference Paper', citations: 8930, doi: '10.18653/v1/N19-1423', tags: ['NLP', 'Language Models'], hasPdf: true, collection: 'all', isComplete: true },
    { id: 3, author: 'Brown et al.', year: '2020', title: 'Language Models are Few-Shot Learners', publication: 'NeurIPS', type: 'Journal Article', citations: 4500, doi: '10.48550/arXiv.2005.14165', tags: ['LLMs', 'Few-Shot'], hasPdf: false, collection: 'phd', isComplete: true },
    { id: 4, author: 'Goodfellow et al.', year: '2014', title: 'Generative Adversarial Nets', publication: 'NeurIPS', type: 'Conference Paper', citations: 21000, doi: '10.5555/2969033.2969125', tags: ['GANs', 'Generative Models'], hasPdf: true, collection: 'grant', isComplete: true },
    { id: 5, author: 'LeCun, Bengio, Hinton', year: '2015', title: 'Deep learning', publication: 'Nature', type: 'Journal Article', citations: 35000, doi: '10.1038/nature14539', tags: ['Deep Learning', 'Review'], hasPdf: true, collection: 'all', isComplete: true },
    { id: 6, author: 'Unknown', year: '2022', title: 'Incomplete Citation Example', publication: '', type: 'Preprint', citations: 0, doi: '10.1234/incomplete', tags: ['Draft'], hasPdf: false, collection: 'all', isComplete: false },
  ]);

  const [activeCollection, setActiveCollection] = useState('all');

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const syncMetadata = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/references/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references })
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      const data = await response.json();
      if (data.references) {
        setReferences(data.references);
      }
    } catch (error) {
      console.error("Failed to sync metadata:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImportedFileName(file.name);
      setIsBatchProcessing(true);
      setBatchStep('processing');
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setBatchStep('conflicts');
            return 100;
          }
          return p + 10;
        });
      }, 300);
    }
  };

  const resolveConflict = (action: 'keep' | 'replace' | 'skip') => {
    setBatchStep('done');
    setTimeout(() => {
      setIsBatchProcessing(false);
      if (action !== 'skip') {
        setReferences([{ 
          id: Date.now(), 
          author: 'Imported Author', 
          year: new Date().getFullYear().toString(), 
          title: `Data from ${importedFileName || 'Imported File'}`, 
          publication: 'Unknown', 
          type: 'Imported', 
          citations: 0, 
          doi: '', 
          tags: ['Imported'], 
          hasPdf: importedFileName.endsWith('.pdf'),
          collection: 'all',
          isComplete: false
        }, ...references]);
      }
    }, 1500);
  };

  const duplicateReference = (ref: any) => {
    const newRef = { ...ref, id: Date.now(), title: ref.title + ' (Copy)' };
    setReferences([newRef, ...references]);
  };

  const deleteReference = (id: number) => {
    setReferences(references.filter(r => r.id !== id));
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === 'references-list') {
      // Reordering
      const items = Array.from(references);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setReferences(items);
    } else {
      // Moving to collection
      const collectionId = destination.droppableId;
      const refId = parseInt(draggableId);
      
      setReferences(refs => refs.map(ref => 
        ref.id === refId ? { ...ref, collection: collectionId } : ref
      ));
    }
  };

  const collections = [
    { id: 'all', name: 'All References', icon: Folder, count: references.length },
    { id: 'favorites', name: 'Favorites', icon: Bookmark, count: 14 },
    { id: 'phd', name: 'PhD Thesis', icon: Folder, count: references.filter(r => r.collection === 'phd').length },
    { id: 'grant', name: 'Grant Proposal', icon: Folder, count: references.filter(r => r.collection === 'grant').length },
  ];

  let filteredReferences = activeCollection === 'all' 
    ? references 
    : references.filter(r => r.collection === activeCollection);

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredReferences = filteredReferences.filter(r => 
      r.title.toLowerCase().includes(query) || 
      r.author.toLowerCase().includes(query) ||
      (r.doi && r.doi.toLowerCase().includes(query))
    );
  }

  let displayReferences = [...filteredReferences];
  if (sortOrder === 'year') {
    displayReferences.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  } else if (sortOrder === 'author') {
    displayReferences.sort((a, b) => a.author.localeCompare(b.author));
  } else if (sortOrder === 'newest') {
    displayReferences.sort((a, b) => b.id - a.id);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-6">
        <div className="flex justify-between items-end">
          <div>
             <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Reference Library</h2>
             <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
               Organize, search, and manage your academic references. Drag and drop references to reorder or move to collections.
             </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            
            <input 
              type="file" 
              multiple 
              accept=".ris,.bib,.xml,.pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" /> Import Batch
            </button>
            <button
              onClick={syncMetadata}
              disabled={isSyncing}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Metadata'}
            </button>
          </div>
        </div>

        {isBatchProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-lg font-bold text-slate-900">Batch Import Process</h3>
                 <p className="text-sm font-medium text-slate-500 mt-1">Extracting metadata from files</p>
               </div>
               
               <div className="p-6">
                  {batchStep === 'processing' && (
                    <div className="flex flex-col gap-4 text-center items-center py-4">
                       <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                       <h4 className="text-sm font-bold text-slate-900">Parsing Citations...</h4>
                       <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                       </div>
                       <p className="text-xs text-slate-500 font-medium">{progress}% Complete</p>
                    </div>
                  )}

                  {batchStep === 'conflicts' && (
                    <div className="flex flex-col gap-4">
                       <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                          <div>
                             <h4 className="text-sm font-bold mb-1">Duplicate Detected</h4>
                             <p className="text-xs font-medium opacity-80 mb-3">
                               The imported reference matches an existing entry in your library. How would you like to handle this?
                             </p>
                             <div className="bg-white/60 p-3 rounded-lg border border-amber-200/50 mb-3">
                                <p className="text-xs font-bold mb-1">Attention is all you need</p>
                                <p className="text-[10px] uppercase tracking-widest opacity-75">Vaswani et al. • 2017</p>
                             </div>
                             <div className="flex gap-2">
                               <button onClick={() => resolveConflict('skip')} className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">Skip</button>
                               <button onClick={() => resolveConflict('replace')} className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">Replace Old</button>
                               <button onClick={() => resolveConflict('keep')} className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm">Keep Both</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {batchStep === 'done' && (
                    <div className="flex flex-col gap-4 text-center items-center py-6">
                       <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                          <FileCheck2 className="w-6 h-6" />
                       </div>
                       <h4 className="text-sm font-bold text-slate-900">Import Complete</h4>
                       <p className="text-xs text-slate-500 font-medium">Successfully processed references.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        <div className="flex gap-6 h-full min-h-0">
          {/* Collections Sidebar */}
          <div className="w-64 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 overflow-y-auto p-4">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Collections</div>
             <div className="space-y-1 mb-6">
               {collections.map(col => {
                 const Icon = col.icon;
                 const isActive = activeCollection === col.id;
                 return (
                   <Droppable droppableId={col.id} key={col.id} isDropDisabled={col.id === 'all'}>
                     {(provided, snapshot) => (
                       <button 
                         ref={provided.innerRef}
                         {...provided.droppableProps}
                         onClick={() => setActiveCollection(col.id)}
                         className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-semibold text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'} ${snapshot.isDraggingOver ? 'bg-indigo-100 ring-2 ring-indigo-400 ring-inset' : ''}`}
                       >
                         <span className="flex items-center gap-2">
                           <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                           {col.name}
                         </span>
                         <span className={`text-xs ${isActive ? 'bg-indigo-100 px-1.5 rounded' : 'text-slate-400'}`}>{col.count}</span>
                         {/* Hidden element to satisfy droppable requirements if empty */}
                         <div style={{ display: 'none' }}>{provided.placeholder}</div>
                       </button>
                     )}
                   </Droppable>
                 );
               })}
             </div>

             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Tags</div>
             <div className="flex flex-wrap gap-2 px-2">
               {['Deep Learning', 'NLP', 'Computer Vision', 'Transformers', 'Review', 'Clinical Trial'].map(tag => (
                  <span key={tag} className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer px-2 py-1 rounded-md flex items-center gap-1">
                     <Hash className="w-3 h-3 text-slate-400" /> {tag}
                  </span>
               ))}
             </div>
          </div>

          {/* Reference Cards Area */}
          <div className="flex-1 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search references, authors, DOI..." 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-sm font-semibold border border-slate-200 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="text-slate-600 border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                   <option value="custom">Sort by: Custom Order</option>
                   <option value="newest">Sort by: Newest Added</option>
                   <option value="year">Sort by: Publication Year</option>
                   <option value="author">Sort by: Author (A-Z)</option>
                </select>
              </div>
            </div>

            <Droppable droppableId="references-list">
              {(provided) => (
                <div 
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {displayReferences.map((ref, index) => {
                    const isSelected = selected.includes(ref.id);
                    return (
                      // @ts-expect-error React 19 typings mismatch with hello-pangea-dnd
                      <Draggable key={ref.id} draggableId={ref.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white border rounded-xl p-5 shadow-sm transition-all flex gap-4 ${isSelected ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'} ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 opacity-90' : 'hover:shadow-md'}`}
                          >
                            <div className="pt-1 flex flex-col items-center gap-3">
                               <div {...provided.dragHandleProps} className="cursor-grab text-slate-400 hover:text-slate-600">
                                 <GripVertical className="w-4 h-4" />
                               </div>
                               <button onClick={() => toggleSelect(ref.id)} className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                  {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                               </button>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                 <h3 className="text-lg font-bold text-slate-900 leading-tight">{ref.title}</h3>
                                 <div className="flex items-center gap-2 shrink-0">
                                    {ref.hasPdf && (
                                       <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">
                                         <FileText className="w-3 h-3" /> PDF
                                       </span>
                                    )}
                                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                                       <button 
                                         onClick={() => {
                                           navigator.clipboard.writeText(`${ref.author} (${ref.year}). ${ref.title}. ${ref.publication}.`);
                                         }}
                                         className="text-slate-400 hover:text-emerald-600 p-1.5 rounded hover:bg-emerald-50 transition-colors" title="Copy Citation">
                                         <BookMarked className="w-4 h-4" />
                                       </button>
                                       <button className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                       <button onClick={() => duplicateReference(ref)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                       <button onClick={() => deleteReference(ref.id)} className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2 flex-wrap">
                                 <span className={ref.isComplete ? "text-slate-900" : "text-amber-600 font-bold"}>{ref.author}</span>
                                 <span className="text-slate-300">•</span>
                                 <span>{ref.year}</span>
                                 <span className="text-slate-300">•</span>
                                 <span className="italic">{ref.publication || 'Unknown Publication'}</span>
                                 <span className="text-slate-300">•</span>
                                 <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{ref.type}</span>
                                 {!ref.isComplete && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-2 border border-amber-200 flex items-center gap-1">
                                      <RefreshCw className="w-3 h-3" /> Needs Sync
                                    </span>
                                 )}
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                 <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
                                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                                    >
                                      <Database className="w-3.5 h-3.5" /> 
                                      {expandedId === ref.id ? 'Hide Evidence' : 'View Extracted Evidence'}
                                    </button>
                                    <div className="flex items-center gap-1">
                                      {ref.tags.map(tag => (
                                         <span key={tag} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                                           {tag}
                                         </span>
                                      ))}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                                    <span title="Citations">Citations: {ref.citations.toLocaleString()}</span>
                                    {ref.doi && (
                                       <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                                         DOI: {ref.doi} <ExternalLink className="w-3 h-3" />
                                       </a>
                                    )}
                                 </div>
                              </div>

                              {expandedId === ref.id && (
                                <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-widest">
                                    <FileCheck2 className="w-4 h-4 text-emerald-600" /> Evidence Audit Matrix
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Study Design</span>
                                      <span className="text-sm font-semibold text-slate-800">Prospective Cohort Study (N=350)</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Primary Finding</span>
                                      <span className="text-sm font-semibold text-slate-800">Significant correlation (p&lt;0.01)</span>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                     <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                                       <div className="flex items-center justify-between mb-2">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extracted Claim (Results, Page 4)</span>
                                         <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-widest">Strong Support</span>
                                       </div>
                                       <p className="font-serif leading-relaxed">"The implementation of the novel diagnostic protocol reduced false-positive rates by 24.3% compared to the standard of care."</p>
                                     </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
