/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { Assistant } from './components/Assistant';
import { WritingWorkspace } from './components/WritingWorkspace';
import { LiteratureReview } from './components/LiteratureReview';
import { CitationManager } from './components/CitationManager';
import { CitationValidator } from './components/CitationValidator';
import { ExportCenter } from './components/ExportCenter';
import { SettingsPanel } from './components/SettingsPanel';
import { CommandPalette } from './components/CommandPalette';
import { GlobalDropZone } from './components/GlobalDropZone';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Dashboard';
      case 'library': return 'Reference Library';
      case 'literature': return 'Literature Review';
      case 'writing': return 'Writing Workspace';
      case 'citation': return 'Citation Manager';
      case 'assistant': return 'AI Assistant';
      case 'validator': return 'Citation Validator';
      case 'submission': return 'Export & Submission';
      case 'settings': return 'Settings';
      default: return 'ResearchFlow AI';
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onViewChange={setCurrentView} />;
      case 'library': return <Library />;
      case 'assistant': return <Assistant />;
      case 'writing': return <WritingWorkspace />;
      case 'literature': return <LiteratureReview />;
      case 'citation': return <CitationManager />;
      case 'validator': return <CitationValidator />;
      case 'submission': return <ExportCenter />;
      case 'settings': return <SettingsPanel />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full p-8 text-center bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
               <span className="text-2xl font-serif text-slate-400">i</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-slate-800 mb-2">Module Under Construction</h3>
            <p className="max-w-sm text-sm font-medium text-slate-500 leading-relaxed">The {getTitle()} module is currently being built for ResearchFlow AI.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle()} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onNavigate={setCurrentView}
      />
      <GlobalDropZone />
    </div>
  );
}
