'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Flame, Send, Cpu, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { ForgeButton } from '@/components/ForgeButton';
import ReactMarkdown from 'react-markdown';
import { 
  AreaChart,
  Area,
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PathfinderPage() {
  const router = useRouter();
  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Protocol Architect online. Define your ambition and duration.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [customStake, setCustomStake] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (extractedData?.stake && !customStake) {
      setCustomStake(extractedData.stake);
    }
  }, [messages, extractedData, customStake]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!overrideText) {
      setInput('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      
      const data = await response.json();
      
      if (data.text) {
        let text = data.text;
        
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1].trim());
            if (parsed.is_final) {
              setExtractedData(parsed);
              setCustomStake(parsed.stake || '₹500');
            }
          } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
          }
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    // 1. Remove the JSON block from display
    const contentWithoutJson = content.replace(/```json[\s\S]*?```/g, '').trim();

    // 2. Parse out any bracketed options like [ 7 Days ]
    const options: string[] = [];
    const regex = /\[\s*([^\]]+?)\s*\]/g;
    let match;
    while ((match = regex.exec(contentWithoutJson)) !== null) {
      const opt = match[1].trim();
      // Ensure it doesn't look like a markdown link url, image path or empty
      if (opt && !opt.startsWith('http') && !opt.includes('/') && opt.length < 50) {
        options.push(opt);
      }
    }

    // 3. Clean the markdown to remove the `[ Option ]` bracketed text so it doesn't render as redundant raw text
    let cleanContent = contentWithoutJson;
    options.forEach(opt => {
      // Escape special regex characters in the option text
      const escapedOpt = opt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Create a regex to match either `[opt]` or `` `[opt]` `` or similar variations
      const rx = new RegExp(`\`?\\s*\\[\\s*${escapedOpt}\\s*\\]\\s*\`?`, 'g');
      cleanContent = cleanContent.replace(rx, '');
    });

    // Clean up double lines or horizontal rules at the very end
    cleanContent = cleanContent.replace(/\n\s*\n+/g, '\n\n').trim();
    // Strip trailing horizontal rules
    cleanContent = cleanContent.replace(/---\s*$/g, '').trim();

    return (
      <div className="space-y-4">
        <ReactMarkdown>{cleanContent}</ReactMarkdown>

        {/* Dynamic Clickable Options Rendered as Glassmorphism Buttons */}
        {options.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-white/5">
            {options.map((opt, idx) => {
              const isCustom = opt.toLowerCase().includes('custom');
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isCustom) {
                      const inputEl = document.querySelector('input[placeholder*="ambition"]') as HTMLInputElement;
                      if (inputEl) {
                        inputEl.focus();
                      }
                    } else {
                      handleSend(opt);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-forge-amber/10 border border-forge-amber/20 text-forge-amber hover:bg-forge-amber hover:text-black hover:border-forge-amber hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,140,0,0.05)] cursor-pointer"
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {content.includes('```json') && (
          <div className="mt-4 p-6 rounded-2xl bg-forge-amber/5 border border-forge-amber/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-forge-amber" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-forge-amber">Protocol Summary Architected</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">Schedule & Stake defined. Ready for verification.</p>
          </div>
        )}
      </div>
    );
  };

  const initiateProtocol = async () => {
    if (!extractedData) return;
    setIsSubmitting(true);
    setSchemaError(null);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Use a try-catch for better error handling during insertion
    try {
      const { error } = await supabase.from('forges').insert({
        user_id: user.id,
        title: extractedData.title || "Untitled Forge",
        category: extractedData.category || "Discipline",
        duration_days: parseInt(extractedData.duration_days) || 30,
        difficulty_curve: extractedData.curve,
        tasks: extractedData.tasks,
        stake: customStake || extractedData.stake || '₹500', 
        verification_method: extractedData.verification_method || 'manual',
        status: 'Active'
      });

      if (error) {
        console.error("Initiation failed:", error.message);
        if (error.message.includes('verification_method')) {
          setSchemaError("CRITICAL: Database column 'verification_method' missing. Please run the updated supabase_schema.sql in your Supabase SQL Editor.");
        } else {
          setSchemaError(`Initiation failed: ${error.message}`);
        }
        setIsSubmitting(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setSchemaError(`System Error: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#030303] text-white font-sans overflow-hidden">
      <header className="px-8 py-5 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-forge-amber/10 border border-forge-amber/20 flex items-center justify-center">
            <Cpu size={16} className="text-forge-amber" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">Protocol Architect</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-forge-amber animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-forge-amber opacity-80 font-bold">Systems Ready</span>
            </div>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-[10px] font-bold uppercase tracking-widest text-forge-muted hover:text-white transition-colors">
          Abort
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar relative">
        <div className="max-w-3xl mx-auto space-y-8 pb-48">
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl ${
                  m.role === 'user' 
                    ? 'bg-forge-amber text-black rounded-br-sm shadow-[0_0_20px_rgba(255,140,0,0.1)]' 
                    : 'bg-white/5 border border-white/5 rounded-bl-sm prose prose-invert prose-p:leading-relaxed prose-sm md:prose-base text-forge-muted focus-within:text-white'
                }`}
              >
                {m.role === 'user' ? (
                  <p className="font-medium text-black text-[15px]">{m.content}</p>
                ) : (
                  renderMessageContent(m.content)
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/5 p-5 rounded-3xl rounded-bl-sm flex gap-2 items-center">
                <span className="h-2 w-2 rounded-full bg-forge-amber animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="h-2 w-2 rounded-full bg-forge-amber animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="h-2 w-2 rounded-full bg-forge-amber animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {extractedData && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mt-12 w-full space-y-8 p-8 rounded-[3rem] bg-white/[0.02] border border-forge-amber/20 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 h-full w-1/2 bg-forge-amber/5 blur-[100px] pointer-events-none" />
                <div className="text-center relative z-10">
                  <Flame className="mx-auto text-forge-amber mb-4" size={32} />
                  <h3 className="text-3xl font-black mb-2">Protocol Ready</h3>
                  <p className="text-forge-amber text-sm font-bold tracking-widest uppercase">Target: {extractedData.title}</p>
                </div>

                <div className="h-64 w-full relative z-10 bg-black/40 rounded-[2rem] border border-white/5 p-6 shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={extractedData.curve}>
                      <defs>
                        <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="intensity" stroke="#FF8C00" strokeWidth={4} fillOpacity={1} fill="url(#colorInt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-5 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-forge-muted uppercase tracking-widest mb-1">Duration</span>
                    <span className="text-2xl font-black">{extractedData.duration_days} Days</span>
                  </div>
                  <div className="p-5 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-forge-muted uppercase tracking-widest mb-1">Financial Stake</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-forge-amber font-bold text-lg">₹</span>
                      <input 
                        type="text" 
                        value={customStake}
                        onChange={(e) => setCustomStake(e.target.value)}
                        className="bg-transparent border-none text-2xl font-black text-white w-24 outline-none focus:ring-0 text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-forge-amber" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Milestone Protocol</h4>
                    </div>
                    <span className="text-[10px] font-bold text-forge-muted">{extractedData.tasks?.length} steps</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {extractedData.tasks?.map((t: any, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-forge-amber/30 transition-all">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-forge-amber/5 border border-forge-amber/10 flex items-center justify-center">
                          <span className="text-[11px] font-black text-forge-amber">{t.day}</span>
                        </div>
                        <div className="flex-1 flex items-center">
                          <p className="text-[13px] font-medium text-forge-muted group-hover:text-white transition-colors">{t.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {schemaError && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center">
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-200 leading-relaxed">{schemaError}</p>
                  </motion.div>
                )}

                <ForgeButton onClick={initiateProtocol} isLoading={isSubmitting} className="w-full h-16 text-lg relative z-10 mt-4 shadow-[0_20px_40px_rgba(255,140,0,0.2)]">
                  Initiate Lock Protocol
                </ForgeButton>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </main>

      <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-20 pb-10 px-4 shrink-0 absolute bottom-0 left-0 right-0 z-[60]">
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Edit protocol or provide new ambition..."
            className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm md:text-base outline-none focus:border-forge-amber/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/20 shadow-2xl"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-14 w-14 flex items-center justify-center bg-forge-amber text-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-forge-gold shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
