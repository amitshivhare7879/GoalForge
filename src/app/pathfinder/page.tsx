'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  Cpu, 
  CheckCircle2,
  Lock,
  Zap,
  Shield
} from 'lucide-react';
import { ForgeButton } from '@/components/ForgeButton';
import { ForgeInput } from '@/components/ForgeInput';
import { 
  AreaChart,
  Area,
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const STEPS = [
  { id: 'intent', title: 'Intent' },
  { id: 'duration', title: 'Timeline' },
  { id: 'verification', title: 'Protocol' },
  { id: 'analysis', title: 'Analysis' },
  { id: 'finalize', title: 'Finalize' },
];

export default function PathfinderPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Form State
  const [currentStep, setCurrentStep] = useState(0);
  const [goalName, setGoalName] = useState('');
  const [duration, setDuration] = useState('66 Days');
  const [category, setCategory] = useState('Coding');
  
  // AI State
  const [aiData, setAiData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(3);
    
    try {
      const response = await fetch('/api/analyze-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalName, duration, category })
      });
      const data = await response.json();
      setAiData(data);
      setCurrentStep(4);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initiateProtocol = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('forges').insert({
      user_id: user.id,
      title: goalName,
      category,
      duration_days: parseInt(duration),
      difficulty_curve: aiData.curve,
      stake: '$200', // Default for MVP
      status: 'Active'
    });

    if (error) {
      console.error("Initiation failed", error);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-sans">
      <header className="px-8 py-8 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2 opacity-50">
          <Flame size={20} className="text-forge-amber" fill="currentColor" />
          <span className="text-xs font-bold uppercase tracking-widest">Protocol Initiation</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-[10px] font-bold uppercase tracking-widest text-forge-muted hover:text-white">
          Cancel
        </button>
      </header>

      <div className="flex h-1 w-full bg-white/5">
        <motion.div 
          className="h-full bg-forge-amber"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Decorative Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-forge-amber/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-xl relative z-10">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="intent" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8 text-center md:text-left">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight">What do you <br /><span className="text-forge-amber">want to forge?</span></h2>
                  <p className="text-forge-muted font-medium text-lg">Define your ambition in one clear sentence.</p>
                </div>
                <ForgeInput 
                  placeholder="e.g. Code for 2 hours every single morning" 
                  autoFocus
                  className="text-lg py-6"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
                <ForgeButton disabled={!goalName} onClick={() => setCurrentStep(1)} className="w-full h-16 text-lg">
                  Next Step
                </ForgeButton>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="duration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="space-y-3 text-center">
                  <h2 className="text-4xl font-black">Timeline</h2>
                  <p className="text-forge-muted font-medium">How many days will you commit to this forge?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['21', '30', '66', '90'].map((d) => (
                    <button 
                      key={d} 
                      onClick={() => setDuration(d)}
                      className={`h-24 rounded-3xl border ${duration.includes(d) ? 'border-forge-amber bg-forge-amber/5' : 'border-white/5 bg-white/[0.02]'} flex flex-col items-center justify-center transition-all`}
                    >
                      <span className="text-2xl font-black">{d}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-forge-muted">Days</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                   <ForgeButton variant="ghost" onClick={() => setCurrentStep(0)} className="w-1/3">Back</ForgeButton>
                   <ForgeButton onClick={() => setCurrentStep(2)} className="flex-1 h-16">Continue</ForgeButton>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="space-y-3 text-center">
                  <h2 className="text-4xl font-black">Protocol</h2>
                  <p className="text-forge-muted font-medium">Select your automated verification layer.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'Coding', title: 'GitHub API', desc: 'Auto-verify commits & PRs', icon: <Cpu />, color: 'indigo-500' },
                    { id: 'Fitness', title: 'Health Connect', desc: 'Sync steps & workouts', icon: <Zap />, color: 'forge-amber' },
                    { id: 'Focus', title: 'AI Proof', desc: 'Document audit via GPT-4o Vision', icon: <Shield />, color: 'forge-muted' },
                  ].map((p) => (
                    <button 
                      key={p.id} 
                      onClick={() => setCategory(p.id)}
                      className={`w-full p-6 rounded-3xl border ${category === p.id ? 'border-forge-amber bg-forge-amber/5' : 'border-white/5 bg-white/[0.02]'} flex items-center gap-6 hover:border-forge-amber/50 transition-all text-left`}
                    >
                       <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${category === p.id ? 'text-forge-amber' : 'text-forge-muted'}`}>
                        {p.icon}
                       </div>
                       <div>
                          <p className="font-bold text-lg">{p.title}</p>
                          <p className="text-sm text-forge-muted">{p.desc}</p>
                       </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                   <ForgeButton variant="ghost" onClick={() => setCurrentStep(1)} className="w-1/3">Back</ForgeButton>
                   <ForgeButton onClick={runAnalysis} className="flex-1 h-16">Analyze Commitment</ForgeButton>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-forge-amber/10 blur-[80px] animate-pulse rounded-full" />
                  <div className="relative h-28 w-28 rounded-[2rem] bg-gradient-to-br from-forge-amber to-forge-gold flex items-center justify-center animate-bounce">
                    <Cpu size={48} className="text-black" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black">Forging Difficulty Curve...</h2>
                  <p className="text-forge-muted font-medium animate-pulse tracking-widest text-[10px] uppercase">AI Pathfinder is analyzing patterns</p>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && aiData && (
              <motion.div key="finalize" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black leading-tight">Protocol Ready.</h2>
                  <p className="text-forge-muted font-medium text-sm max-w-sm mx-auto line-clamp-2 italic">{aiData.persona}</p>
                </div>

                <div className="h-72 w-full bg-white/[0.02] rounded-[3rem] border border-white/5 p-8 relative overflow-hidden">
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiData.curve}>
                      <defs>
                        <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '16px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="intensity" stroke="#FF8C00" strokeWidth={3} fillOpacity={1} fill="url(#colorInt)" />
                    </AreaChart>
                   </ResponsiveContainer>
                   <div className="absolute top-6 left-10 text-[9px] uppercase font-black tracking-[0.3em] text-white/30">AI Generated Curve</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-forge-muted uppercase tracking-widest mb-1">Entry Stake</p>
                      <p className="text-2xl font-black text-white">$200</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-forge-muted uppercase tracking-widest mb-1">Risk Mode</p>
                      <p className="text-2xl font-black text-forge-amber">Aggressive</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/10 text-xs font-medium text-white/40 leading-relaxed text-center">
                      Commitment cannot be paused once initiated. If the API layer detects a failure, your stake is surrendered.
                   </div>
                  <ForgeButton onClick={initiateProtocol} className="w-full h-16 text-lg" isLoading={isSubmitting}>
                    Initiate Protocol
                  </ForgeButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
