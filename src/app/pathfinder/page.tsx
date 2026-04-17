'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Flame, Send, Cpu, CheckCircle2 } from 'lucide-react';
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
    { role: 'assistant', content: 'Welcome to the Forge. I am your Discipline Architect. What ambition are we forging today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [extractedData, setExtractedData] = useState<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, extractedData]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
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
        
        // Check for JSON block
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.is_final) {
              setExtractedData(parsed);
              // Remove JSON block from the readable chat
              text = text.replace(/```json\n([\s\S]*?)\n```/, '').trim();
            }
          } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
          }
        }
        
        if (text) {
          setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateProtocol = async () => {
    if (!extractedData) return;
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: extractedData.title,
      category: extractedData.category,
      duration_days: parseInt(extractedData.duration_days) || 30,
      difficulty_curve: extractedData.curve,
      stake_amount: '$200', // Default for MVP
      status: 'active'
    });

    if (error) {
      console.error("Initiation failed", error);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
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
            <span className="text-sm font-bold tracking-tight">Forge AI</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-forge-amber animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-forge-amber opacity-80 font-bold">Live Session</span>
            </div>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-[10px] font-bold uppercase tracking-widest text-forge-muted hover:text-white transition-colors">
          Abort
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar relative">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
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
                  <ReactMarkdown>{m.content}</ReactMarkdown>
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

          {/* Verification Protocol Graph Rendering */}
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

                <div className="h-64 w-full relative z-10 bg-black/40 rounded-[2rem] border border-white/5 p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={extractedData.curve}>
                      <defs>
                        <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black/90 border border-white/10 p-3 rounded-2xl backdrop-blur-md shadow-2xl">
                                <p className="text-[10px] font-bold text-forge-amber uppercase tracking-widest mb-1">{payload[0].payload.label}</p>
                                <p className="text-xl font-black text-white">{payload[0].value}% <span className="text-[10px] font-medium text-forge-muted">Intensity</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="intensity" 
                        stroke="#FF8C00" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorInt)"
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-5 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-forge-muted uppercase tracking-widest mb-1">Duration</span>
                    <span className="text-2xl font-black">{extractedData.duration_days} Days</span>
                  </div>
                  <div className="p-5 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-forge-muted uppercase tracking-widest mb-1">Category</span>
                    <span className="text-2xl font-black text-forge-amber">{extractedData.category}</span>
                  </div>
                </div>

                <ForgeButton onClick={initiateProtocol} isLoading={isSubmitting} className="w-full h-16 text-lg relative z-10 mt-4">
                  Initiate Lock Protocol
                </ForgeButton>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      {!extractedData && (
        <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-8 px-4 shrink-0 absolute bottom-0 left-0 right-0 z-50">
          <div className="max-w-3xl mx-auto flex gap-3 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell the Forge AI what you want to achieve..."
              className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm md:text-base outline-none focus:border-forge-amber/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/20"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-14 w-14 flex items-center justify-center bg-forge-amber text-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-forge-gold transition-colors hover:scale-105 active:scale-95"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
