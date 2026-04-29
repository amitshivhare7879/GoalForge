'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Send, Brain, Zap, GitCommit, MapPin, Calendar, Activity,
  ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { ForgeButton } from '@/components/ForgeButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CurvePoint {
  day: number;
  intensity: number;
}

interface Task {
  day: number;
  task: string;
}

interface ExtractedPlan {
  is_final: boolean;
  title: string;
  duration_days: number;
  category: string;
  stake: string;
  curve: CurvePoint[];
  tasks: Task[];
  validation_notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip the JSON fence block from a message so we never render raw JSON
 * to the user. Handles ``` json, ```json, ```` json, etc.
 */
function stripJsonFence(content: string): string {
  return content.replace(/`{3,4}json[\s\S]*?`{3,4}/g, '').trim();
}

/**
 * Extract and parse the JSON plan block from an assistant message.
 * Returns null if nothing parseable is found.
 */
function extractPlan(content: string): ExtractedPlan | null {
  const match = content.match(/`{3,4}json\s*([\s\S]*?)\s*`{3,4}/);
  if (!match) return null;

  let jsonStr = match[1]
    // Remove ellipsis placeholders the AI sometimes emits
    .replace(/\[\s*\.\.\.\s*\]/g, '[]')
    .replace(/,?\s*\.\.\.\s*/g, '')
    // Strip trailing commas before closing brackets (not valid JSON)
    .replace(/,\s*([\]}])/g, '$1');

  try {
    const parsed = JSON.parse(jsonStr) as ExtractedPlan;
    if (!parsed.is_final) return null;
    // Guarantee stake has a value so downstream never shows undefined
    parsed.stake = parsed.stake || '₹500';
    return parsed;
  } catch (err) {
    console.error('[GoalForge] Failed to parse plan JSON:', err);
    return null;
  }
}

// ─── Suggestion chips data ────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: 'DSA in 60 days', prompt: 'Learn DSA and crack coding interviews in 60 days' },
  { label: 'Ship an MVP',    prompt: 'Build and ship a SaaS MVP in 45 days' },
  { label: '5K in 30 days',  prompt: 'Run 5K under 25 minutes in 30 days' },
  { label: '5AM habit',      prompt: 'Wake up at 5am every day for 21 days' },
];

// ─── Verification methods list ────────────────────────────────────────────────

const VERIF_METHODS = [
  { icon: GitCommit, label: 'Coding goals → GitHub commits' },
  { icon: MapPin,    label: 'Fitness goals → GPS location' },
  { icon: Calendar,  label: 'Deep work → Google Calendar' },
  { icon: Activity,  label: 'Health goals → Health Connect' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PathfinderPage() {
  const router = useRouter();
  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Welcome. I'm the GoalForge AI Pathfinder — your discipline architect.\n\n" +
        "I don't just generate plans. I **validate timelines**, flag unrealistic goals, " +
        "and calibrate intensity based on what your specific goal actually demands.\n\n" +
        'Tell me what you want to forge. Be specific — the more detail you give me, the better the plan.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(null);
  // Separate controlled state for the editable stake field so editing
  // doesn't trigger a full re-render of the plan object on every keystroke.
  const [stakeInput, setStakeInput] = useState('');

  // Keep stakeInput in sync whenever a new plan arrives
  useEffect(() => {
    if (extractedPlan) setStakeInput(extractedPlan.stake);
  }, [extractedPlan]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Send message ────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const rawText: string = data.text ?? '';

      // Try extracting a finalised plan from this response
      const plan = extractPlan(rawText);
      if (plan) setExtractedPlan(plan);

      // Always add the assistant message — but strip the JSON fence so the
      // user only sees the human-readable portion.
      const displayText = stripJsonFence(rawText);
      if (displayText) {
        setMessages(prev => [...prev, { role: 'assistant', content: displayText }]);
      }
    } catch (err) {
      console.error('[GoalForge] Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I ran into an issue connecting to the server. Please check your network and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      // Return focus to the textarea after the response arrives
      textareaRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendSuggestion = (prompt: string) => {
    setInput(prompt);
    // Slight delay so the state flushes before send fires
    setTimeout(() => {
      setInput('');
      const userMessage: Message = { role: 'user', content: prompt };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })
        .then(r => r.json())
        .then(data => {
          const rawText: string = data.text ?? '';
          const plan = extractPlan(rawText);
          if (plan) setExtractedPlan(plan);
          const displayText = stripJsonFence(rawText);
          if (displayText) setMessages(prev => [...prev, { role: 'assistant', content: displayText }]);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, 0);
  };

  // ── Commit goal ─────────────────────────────────────────────────────────────

  const initiateProtocol = async () => {
    if (!extractedPlan || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('forges').insert({
        user_id: user.id,
        title: extractedPlan.title || 'Untitled Forge',
        category: extractedPlan.category || 'Discipline',
        duration_days: Number(extractedPlan.duration_days) || 30,
        tasks: extractedPlan.tasks,
        stake: stakeInput || extractedPlan.stake || '₹500',
        status: 'Active',
      });

      if (error) {
        console.error('[GoalForge] Insert failed:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `**Forge initiation failed.** ${error.message}. Please try again.`,
          },
        ]);
        setIsSubmitting(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[GoalForge] Unexpected error:', err);
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <div className="view active" id="view-pathfinder" style={{ padding: 0 }}>
      <div className="pathfinder-layout" style={{ height: 'calc(100vh - 57px)' }}>
        
        {/* CHAT COLUMN */}
        <div className="pf-chat">
          <div className="pf-chat-header">
            <div className="pf-ai-avatar">
              <Brain size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>AI Pathfinder</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Elite discipline architect</div>
            </div>
            <div className="pf-chat-status"></div>
          </div>

          <div className="pf-messages custom-scrollbar" id="pf-messages">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => {
                const isAI = m.role === 'assistant';
                const isFirst = i === 0;
                const showPlanCallout = isAI && extractedPlan !== null && i === messages.length - 1;

                if (!isAI) {
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pf-msg user"
                    >
                      <div className="pf-msg-av user">US</div>
                      <div className="pf-bubble">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pf-msg ai"
                  >
                    <div className="pf-msg-av ai">
                      <Brain size={14} />
                    </div>
                    <div className="pf-bubble">
                      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-strong:text-amber-400 prose-em:text-[var(--text2)]">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>

                      {isFirst && (
                        <div className="suggestion-chips" style={{ marginTop: '12px' }}>
                          {SUGGESTIONS.map(s => (
                            <div
                              key={s.label}
                              className="chip"
                              onClick={() => sendSuggestion(s.prompt)}
                            >
                              {s.label}
                            </div>
                          ))}
                        </div>
                      )}

                      {showPlanCallout && (
                        <div className="flex items-start gap-2 rounded-[var(--r)] border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400 mt-3">
                          <ShieldCheck size={14} className="mt-px shrink-0" />
                          <span>
                            <strong>Plan generated.</strong> Review the parameters on the right panel, adjust your stake if needed, then hit <em>Commit to forge</em>.
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pf-msg ai"
                >
                  <div className="pf-msg-av ai">
                    <Brain size={14} />
                  </div>
                  <div className="pf-bubble">
                    <div className="pf-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>

          <div className="pf-input-area">
            <div className="pf-input-row">
              <textarea
                ref={textareaRef}
                className="pf-input"
                id="pf-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your goal..."
                rows={2}
              />
              <button
                className="pf-send"
                id="pf-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '8px' }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* PANEL COLUMN */}
        <div className="pf-panel custom-scrollbar">
          <div className="pf-panel-section">
            <div className="pf-panel-h">Difficulty curve preview</div>

            {!extractedPlan ? (
              <div id="curve-empty" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--rlg)', padding: '32px', textAlign: 'center' }}>
                <Activity size={24} style={{ color: 'var(--text3)', margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: '12px', color: 'var(--text3)' }}>
                  Your difficulty curve will appear here once the AI generates your plan.
                </p>
              </div>
            ) : (
              <div id="curve-chart">
                <div style={{ height: '120px', width: '100%', marginBottom: '6px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={extractedPlan.curve}>
                      <defs>
                        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="rounded border border-white/10 bg-black/90 px-2.5 py-1.5 backdrop-blur-md">
                              <p className="text-[10px] font-bold uppercase text-amber-400">
                                Day {payload[0].payload.day}
                              </p>
                              <p className="text-sm font-black text-white">
                                {payload[0].value}% intensity
                              </p>
                            </div>
                          ) : null
                        }
                      />
                      <Area
                        type="stepAfter"
                        dataKey="intensity"
                        stroke="var(--amber)"
                        strokeWidth={2}
                        fill="url(#curveGrad)"
                        dot={false}
                        activeDot={{ r: 3, fill: 'var(--amber)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="curve-labels">
                  <span>Day 1</span>
                  <span>Day {Math.ceil((extractedPlan.duration_days ?? 30) / 2)}</span>
                  <span>Day {extractedPlan.duration_days ?? 30}</span>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {extractedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="pf-panel-section" id="plan-confirm-wrap">
                  <div className="pf-panel-h">Plan summary</div>
                  <div className="confirm-card">
                    <div className="confirm-row">
                      <span className="confirm-row-key">Goal</span>
                      <span className="confirm-row-val max-w-[180px] truncate" title={extractedPlan.title}>{extractedPlan.title || '—'}</span>
                    </div>
                    <div className="confirm-row">
                      <span className="confirm-row-key">Category</span>
                      <span className="confirm-row-val">{extractedPlan.category || '—'}</span>
                    </div>
                    <div className="confirm-row">
                      <span className="confirm-row-key">Duration</span>
                      <span className="confirm-row-val">{extractedPlan.duration_days} days</span>
                    </div>
                    <div className="confirm-row pt-2">
                      <span className="confirm-row-key">Stake</span>
                      <span className="confirm-row-val amber flex items-center justify-end">
                        <input
                          type="text"
                          value={stakeInput}
                          onChange={e => setStakeInput(e.target.value)}
                          aria-label="Adjust stake amount"
                          className="w-24 rounded border border-transparent bg-transparent text-right outline-none transition-all focus:border-amber-500/40 focus:bg-white/5 focus:px-1"
                        />
                      </span>
                    </div>
                  </div>

                  {extractedPlan.validation_notes && (
                    <div className="mt-3 flex items-start gap-2 rounded-[var(--r)] border border-amber-500/20 bg-amber-500/8 p-3 text-xs text-amber-300">
                      <AlertTriangle size={13} className="mt-px shrink-0" />
                      <span>{extractedPlan.validation_notes}</span>
                    </div>
                  )}
                </div>

                <div className="pf-panel-section" id="commit-btn-wrap">
                  <ForgeButton
                    isLoading={isSubmitting}
                    onClick={initiateProtocol}
                    className="btn btn-amber btn-full"
                  >
                    <Zap size={16} /> Commit to forge
                  </ForgeButton>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '8px' }}>
                    This will lock your stake and begin passive verification.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pf-panel-section">
            <div className="pf-panel-h">Verification methods</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {VERIF_METHODS.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text2)' }}>
                  <Icon size={14} style={{ color: 'var(--text3)' }} /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}