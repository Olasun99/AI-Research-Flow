import React, { useState } from 'react';
import { FileDown, FileText, CheckCircle2, AlertCircle, Send, ArrowRight, Loader2, Info } from 'lucide-react';
import { jsPDF } from 'jspdf';

export function ExportCenter() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingBib, setIsExportingBib] = useState(false);

  const runPreflight = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setCheckComplete(true);
    }, 2000);
  };

  const exportToPDF = () => {
    setIsExportingPDF(true);
    // Simulate fetching content from WritingWorkspace
    setTimeout(() => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const margin = 20;
      let yPosition = margin;
      
      // Title
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      const title = 'A Comprehensive Review of Deep Learning Architectures';
      const splitTitle = doc.splitTextToSize(title, 210 - margin * 2);
      doc.text(splitTitle, 105, yPosition, { align: 'center' });
      yPosition += 15 * splitTitle.length;
      
      // Author
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      doc.text('John Doe', 105, yPosition, { align: 'center' });
      yPosition += 20;

      // Abstract
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text('Abstract', 105, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      const abstract = 'This paper provides a comprehensive overview of recent advancements in deep learning. We analyze various neural network architectures, focusing on Convolutional Neural Networks (CNNs) and Transformers, and discuss their applications across different domains such as computer vision and natural language processing. The review highlights both the achievements and current limitations of these models.';
      const splitAbstract = doc.splitTextToSize(abstract, 210 - margin * 2);
      doc.text(splitAbstract, margin, yPosition);
      yPosition += 6 * splitAbstract.length + 10;

      // Body Paragraph
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('1. Introduction', margin, yPosition);
      yPosition += 8;

      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      const body = 'In recent years, artificial intelligence has witnessed unprecedented growth, largely driven by deep learning methodologies. These approaches have fundamentally transformed how machines process and interpret complex data structures, leading to breakthroughs in areas previously thought to be exclusive to human intelligence. The advent of large-scale datasets and significant improvements in computational power, particularly through GPUs, have enabled the training of models with billions of parameters.';
      const splitBody = doc.splitTextToSize(body, 210 - margin * 2);
      doc.text(splitBody, margin, yPosition);
      
      doc.save('academic-manuscript.pdf');
      setIsExportingPDF(false);
    }, 1500);
  };

  const simulateExport = (type: string, filename: string) => {
    if (type === 'docx') setIsExportingDocx(true);
    if (type === 'bibtex') setIsExportingBib(true);
    
    setTimeout(() => {
      const blob = new Blob([`Simulated ${type} export content`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (type === 'docx') setIsExportingDocx(false);
      if (type === 'bibtex') setIsExportingBib(false);
    }, 1500);
  };

  const formats = [
    { id: 'docx', name: 'Microsoft Word', ext: '.docx', desc: 'Formatted with references and styles.', action: () => simulateExport('docx', 'manuscript.docx'), isExporting: isExportingDocx },
    { id: 'pdf', name: 'PDF Document', ext: '.pdf', desc: 'Print-ready layout for submission.', action: exportToPDF, isExporting: isExportingPDF },
    { id: 'bibtex', name: 'BibTeX', ext: '.bib', desc: 'Raw citation data for LaTeX integration.', action: () => simulateExport('bibtex', 'references.bib'), isExporting: isExportingBib }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)] gap-8 overflow-y-auto">
      <div>
         <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Export & Submission Center</h2>
         <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed">
           Generate cleanly formatted outputs or run a Journal-Specific Pre-flight check to validate mandatory fields before submitting your manuscript.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Formats */}
        <div className="flex flex-col gap-4">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Export Formats</h3>
           {formats.map(format => (
             <div key={format.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileDown className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {format.name}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded">{format.ext}</span>
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">{format.desc}</p>
                   </div>
                </div>
                <button 
                  onClick={format.action}
                  disabled={format.isExporting}
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors shrink-0 disabled:opacity-50 flex items-center gap-2"
                >
                   {format.isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                   Export
                </button>
             </div>
           ))}
        </div>

        {/* Pre-flight Check */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
           <div className="p-5 border-b border-slate-100 bg-slate-50/50">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Journal Pre-flight Check</h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Nature Medicine</span>
             </div>
             <p className="text-xs font-medium text-slate-500 mb-4">
               Validating structural requirements, word limits, and citation formats against Nature Medicine's author guidelines.
             </p>
             <button 
               onClick={runPreflight}
               disabled={isChecking || checkComplete}
               className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
             >
               {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : (checkComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />)}
               {isChecking ? 'Validating Manuscript...' : (checkComplete ? 'Pre-flight Complete' : 'Run Pre-flight Check')}
             </button>
           </div>
           
           <div className="p-5 flex flex-col gap-4 flex-1">
             <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${checkComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                   {checkComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                </div>
                <div>
                   <h4 className={`text-sm font-bold ${checkComplete ? 'text-slate-900' : 'text-slate-500'}`}>Reference Formatting</h4>
                   <p className="text-xs font-medium text-slate-400 mt-1">Verified: Vancouver numerical (superscript).</p>
                </div>
             </div>

             <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${checkComplete ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                   {checkComplete ? <AlertCircle className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                </div>
                <div>
                   <h4 className={`text-sm font-bold ${checkComplete ? 'text-slate-900' : 'text-slate-500'}`}>Word Count Limits</h4>
                   <p className={`text-xs font-medium mt-1 ${checkComplete ? 'text-amber-700' : 'text-slate-400'}`}>
                     {checkComplete ? 'Warning: Abstract is 214 words (limit: 200).' : 'Checking abstract and body limits.'}
                   </p>
                </div>
             </div>

             <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${checkComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                   {checkComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                </div>
                <div>
                   <h4 className={`text-sm font-bold ${checkComplete ? 'text-slate-900' : 'text-slate-500'}`}>Title Page Declarations</h4>
                   <p className="text-xs font-medium text-slate-400 mt-1">Found Data Availability and Conflict of Interest statements.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
