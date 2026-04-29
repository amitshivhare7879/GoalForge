'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Send, Brain, Zap, Github, MapPin, Calendar, Activity, 
  ShieldAlert, Shield 
} from 'lucide-react';
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { ForgeButton } from '@/components/ForgeButton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PathfinderPage() {
  const router = useRouter();
  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome. I\'m the GoalForge AI Pathfinder — your discipline architect.\n\nI don\'t just generate plans. I **validate timelines**, flag unrealistic goals, and calibrate intensity based on what your specific goal actually demands.\n\nTell me what you want to forge. Be specific — the more detail you give me, the better the plan.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, extractedData]);

  const sendSuggestion = (text: string) => {
    setInput(text);
  };

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
        const jsonMatch = text.match(/`{3,4}json\n([\s\S]*?)\n`{3,4}/);
        if (jsonMatch) {
          try {
            let jsonString = jsonMatch[1]
              .replace(/\[\s*\.\.\.\s*\]/g, '[]')
              .replace(/\.\.\./g, '')
              .trim();
              
            // Remove trailing commas before ] or }
            jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');

            const parsed = JSON.parse(jsonString);
            if (parsed.is_final) {
               parsed.stake = parsed.stake || '₹500';
              setExtractedData(parsed);
            }
          } catch (e) {
             console.error("Failed to parse extracted JSON:", e, jsonMatch[1]);
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

    const { error } = await supabase.from('forges').insert({
      user_id: user.id,
      title: extractedData.title || "Untitled Forge",
      category: extractedData.category || "Discipline",
      duration_days: parseInt(extractedData.duration_days) || 30,
      difficulty_curve: extractedData.curve,
      tasks: extractedData.tasks,
      stake: extractedData.stake || '₹500', 
      status: 'Active'
    });

    if (error) {
      console.error("Initiation failed:", error.message, error.details);
      alert(`Forge Initiation Failed: ${error.message}.`);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="view active" id="view-pathfinder" style={{ padding: 0, margin: '-32px' }}>
      <div className="pathfinder-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: 'calc(100vh - 72px)' }}>
        
        {/* CHAT */}
        <div className="pf-chat flex flex-col border-r border-[var(--border)] overflow-hidden">
          
          <div className="pf-chat-header p-[20px_28px] border-b border-[var(--border)] flex items-center gap-[14px] shrink-0 bg-black/40 backdrop-blur-md">
            <div className="pf-ai-avatar w-[38px] h-[38px] rounded-full bg-gradient-to-br from-amber-500 to-blue-400 flex items-center justify-center text-black shrink-0">
              <Brain size={18} />
            </div>
            <div>
              <div className="text-[14px] font-semibold">AI Pathfinder</div>
              <div className="text-[11px] text-[var(--text2)]">Elite discipline architect</div>
            </div>
            <div className="pf-chat-status w-[8px] h-[8px] rounded-full bg-green-500 ml-auto animate-pulse"></div>
          </div>

          <div className="pf-messages flex-1 overflow-y-auto p-[28px] custom-scrollbar space-y-6">
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`pf-msg flex gap-[12px] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`pf-msg-av w-[32px] h-[32px] rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold ${m.role === 'assistant' ? 'bg-gradient-to-br from-amber-500 to-blue-400 text-black' : 'bg-[var(--surf2)] text-[var(--text2)]'}`}>
                    {m.role === 'assistant' ? <Brain size={14} /> : 'US'}
                  </div>
                  <div className={`pf-bubble max-w-[78%] p-[14px_18px] text-[14px] leading-[1.65] ${m.role === 'assistant' ? 'bg-[var(--surface)] border border-[var(--border)] rounded-[4px_var(--rlg)_var(--rlg)_var(--rlg)]' : 'bg-[var(--amberDim)] border border-amber-500/20 text-white rounded-[var(--rlg)_4px_var(--rlg)_var(--rlg)]'}`}>
                    <ReactMarkdown className="markdown-body">
                      {m.content.includes('```json') ? m.content.split('```json')[0].trim() : m.content}
                    </ReactMarkdown>

                    {/* Pre-fill suggestion chips on first message */}
                    {i === 0 && (
                      <div className="suggestion-chips flex flex-wrap gap-[8px] mt-[16px]">
                        <div className="chip bg-[var(--surf2)] border border-[var(--border)] rounded-full p-[6px_14px] text-[12px] text-[var(--text2)] cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 transition-all" onClick={() => sendSuggestion('Learn DSA and crack coding interviews in 60 days')}>DSA in 60 days</div>
                        <div className="chip bg-[var(--surf2)] border border-[var(--border)] rounded-full p-[6px_14px] text-[12px] text-[var(--text2)] cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 transition-all" onClick={() => sendSuggestion('Build and ship a SaaS MVP in 45 days')}>Ship an MVP</div>
                        <div className="chip bg-[var(--surf2)] border border-[var(--border)] rounded-full p-[6px_14px] text-[12px] text-[var(--text2)] cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 transition-all" onClick={() => sendSuggestion('Run 5K under 25 minutes in 30 days')}>5K in 30 days</div>
                        <div className="chip bg-[var(--surf2)] border border-[var(--border)] rounded-full p-[6px_14px] text-[12px] text-[var(--text2)] cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 transition-all" onClick={() => sendSuggestion('Wake up at 5am every day for 21 days')}>5AM habit</div>
                      </div>
                    )}

                    {m.content.includes('```json') && (
                       <div className="flex items-start gap-[8px] bg-red-500/10 border border-red-500/20 rounded-[var(--r)] p-[10px_14px] m-[10px_0] text-[13px] text-red-400">
                          <ShieldAlert size={16} className="shrink-0 mt-[1px]" />
                          <div>
                            <span className="font-bold text-amber-500">Plan Generated.</span> Review parameters on the right to Initiate lock.
                          </div>
                       </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pf-msg ai">
                   <div className="pf-msg-av ai"><Brain size={14} /></div>
                   <div className="pf-bubble flex items-center min-h-[50px]">
                      <div className="pf-typing flex gap-[4px] p-[6px_0] items-center">
                        <span className="w-[6px] h-[6px] bg-[var(--text3)] rounded-full animate-bounce"></span>
                        <span className="w-[6px] h-[6px] bg-[var(--text3)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-[6px] h-[6px] bg-[var(--text3)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                   </div>
                 </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="pf-input-area p-[20px_28px] border-t border-[var(--border)] shrink-0 bg-black/40 backdrop-blur-md">
            <div className="pf-input-row flex gap-[10px]">
              <textarea 
                className="pf-input flex-1 bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--r)] p-[12px_16px] text-[14px] text-white resize-none max-h-[120px] leading-[1.5] focus:border-[var(--border2)] focus:bg-[var(--surface)] outline-none transition-all placeholder:text-[var(--text3)]" 
                placeholder="Describe your goal..." 
                rows={2} 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              ></textarea>
              <button 
                className="pf-send w-[42px] h-[42px] rounded-[var(--r)] bg-amber-500 text-black flex items-center justify-center cursor-pointer shrink-0 transition-all hover:bg-amber-400 disabled:bg-[var(--surf2)] disabled:text-[var(--text3)] disabled:cursor-not-allowed" 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[11px] text-[var(--text3)] mt-[8px]">Press Enter to send · Shift+Enter for new line</p>
          </div>

        </div>

        {/* PANEL */}
        <div className="pf-panel p-[24px] overflow-y-auto custom-scrollbar bg-[var(--bg2)]">
          <div className="pf-panel-section mb-[28px]">
            <div className="pf-panel-h text-[11px] font-semibold tracking-[.1em] uppercase text-[var(--text3)] mb-[14px]">Difficulty curve preview</div>
            
            {!extractedData ? (
              <div id="curve-empty" className="bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--rlg)] p-[32px] text-center">
                <Activity size={24} className="text-[var(--text3)] mx-auto mb-[10px]" />
                <p className="text-[12px] text-[var(--text3)]">Your difficulty curve will appear here once the AI generates your plan.</p>
              </div>
            ) : (
              <div id="curve-chart">
                <div className="h-[120px] w-full mb-[6px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={extractedData.curve || []}>
                      <defs>
                        <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="var(--amber)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black/90 border border-white/10 p-2 rounded backdrop-blur-md">
                                <p className="text-[10px] font-bold text-amber-500 uppercase">Day {payload[0].payload.day}</p>
                                <p className="text-sm font-black text-white">{payload[0].value}% Int</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="stepAfter" 
                        dataKey="intensity" 
                        stroke="var(--amber)" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorInt)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="curve-labels flex justify-between px-1 text-[10px] text-[var(--text3)]">
                  <span>Day 1</span>
                  <span>Day {Math.floor((extractedData.duration_days || 30) / 2)}</span>
                  <span>Day {extractedData.duration_days || 30}</span>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {extractedData && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-[28px] overflow-hidden">
                <div className="pf-panel-section" id="plan-confirm-wrap">
                  <div className="pf-panel-h text-[11px] font-semibold tracking-[.1em] uppercase text-[var(--text3)] mb-[14px]">Plan summary</div>
                  <div className="confirm-card bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--rlg)] p-[20px]">
                    <div className="confirm-row flex justify-between items-center py-[8px] border-b border-[var(--border)] text-[13px]"><span className="text-[var(--text2)]">Goal</span><span className="font-semibold text-white max-w-[180px] truncate" title={extractedData.title}>{extractedData.title || '—'}</span></div>
                    <div className="confirm-row flex justify-between items-center py-[8px] border-b border-[var(--border)] text-[13px]"><span className="text-[var(--text2)]">Category</span><span className="font-semibold text-white">{extractedData.category || '—'}</span></div>
                    <div className="confirm-row flex justify-between items-center py-[8px] border-b border-[var(--border)] text-[13px]"><span className="text-[var(--text2)]">Duration</span><span className="font-semibold text-white">{extractedData.duration_days || '—'} Days</span></div>
                    <div className="confirm-row flex justify-between items-center pt-[8px] text-[13px]"><span className="text-[var(--text2)]">Stake</span>
                      <span className="font-semibold text-amber-500 flex items-center gap-1">
                        <input 
                          type="text" 
                          value={extractedData.stake}
                          onChange={(e) => setExtractedData({...extractedData, stake: e.target.value})}
                          className="bg-transparent border-none text-right outline-none w-16 focus:bg-white/5 rounded px-1 transition-all"
                        />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pf-panel-section" id="commit-btn-wrap">
                  <ForgeButton className="btn btn-amber w-full justify-center gap-[8px]" isLoading={isSubmitting} onClick={initiateProtocol}>
                    <Zap size={16} /> Commit to forge
                  </ForgeButton>
                  <p className="text-[11px] text-[var(--text3)] text-center mt-[8px]">This will lock your stake and begin passive verification.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pf-panel-section mt-[28px]">
            <div className="pf-panel-h text-[11px] font-semibold tracking-[.1em] uppercase text-[var(--text3)] mb-[14px]">Verification methods</div>
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[10px] text-[12px] text-[var(--text2)]"><Github size={14} className="text-[var(--text3)]" /> Coding goals → GitHub commits</div>
              <div className="flex items-center gap-[10px] text-[12px] text-[var(--text2)]"><MapPin size={14} className="text-[var(--text3)]" /> Fitness goals → GPS location</div>
              <div className="flex items-center gap-[10px] text-[12px] text-[var(--text2)]"><Calendar size={14} className="text-[var(--text3)]" /> Deep work → Google Calendar</div>
              <div className="flex items-center gap-[10px] text-[12px] text-[var(--text2)]"><Activity size={14} className="text-[var(--text3)]" /> Health goals → Health Connect</div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
