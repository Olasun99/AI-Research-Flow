import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your AI Reference Assistant. I can help you understand citation styles, find better sources, explain formatting rules, or help you organize your library. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ query: userMessage.content, context: [] })
      });
      
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI engine.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4 mb-6">
         <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200">
            <Sparkles className="w-6 h-6" />
         </div>
         <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Academic AI Assistant</h2>
            <p className="text-sm font-medium text-slate-500">Ask questions about citation styles, source quality, or specific formatting rules.</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.role === 'assistant' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-xl p-4 text-sm font-medium leading-relaxed ${
                msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-100 text-slate-800 shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-100 shadow-sm rounded-xl p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..." 
              className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-300 rounded-lg transition-colors shadow-md shadow-slate-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 justify-center">
             <AlertCircle className="w-3 h-3" />
             <span>AI can make mistakes. Always verify final citations before publishing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
