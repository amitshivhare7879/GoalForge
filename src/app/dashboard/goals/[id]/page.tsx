'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Flame, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ForgeButton } from '@/components/ForgeButton';

interface Goal {
  id: string;
  title: string;
  category: string;
  duration_days: number;
  stake_amount: string;
  status: string;
  difficulty_curve: any[];
  created_at: string;
}

export default function GoalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoal = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        console.error("Failed to fetch goal", error);
        router.push('/dashboard');
        return;
      }

      setGoal(data);
      setIsLoading(false);
    };

    fetchGoal();
  }, [id, router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-forge-amber/20 border-t-forge-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!goal) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forge-muted">{goal.category}</span>
            <span className="font-bold">{goal.title}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-1/2 bg-forge-amber/5 blur-[100px] pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-2xl font-black">Difficulty Curve</h2>
                <span className="px-3 py-1 rounded-full bg-forge-amber/10 border border-forge-amber/20 text-[10px] font-bold text-forge-amber uppercase tracking-widest">
                  Active
                </span>
              </div>
              
              <div className="h-72 w-full relative z-10 bg-black/40 rounded-[2rem] border border-white/5 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={goal.difficulty_curve}>
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
                    <Area type="monotone" dataKey="intensity" stroke="#FF8C00" strokeWidth={4} fillOpacity={1} fill="url(#colorInt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
              <h2 className="text-2xl font-black mb-6">Verification Protocol</h2>
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-3xl bg-black/20">
                <Shield size={48} className="text-forge-muted mb-4 opacity-50" />
                <p className="text-forge-muted mb-6 text-center max-w-sm">
                  Today's verification window is currently open. Passive confirmation via {goal.category} will trigger automatically.
                </p>
                <ForgeButton variant="ghost">Force Manual Sync</ForgeButton>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5">
               <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted mb-2">Skin In The Game</p>
               <p className="text-5xl font-black mb-4">{goal.stake_amount}</p>
               <div className="w-full bg-forge-amber/10 text-forge-amber text-xs font-bold p-3 rounded-xl text-center">
                 Locked in Escrow
               </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
              <h3 className="font-bold mb-6">Protocol Integrity</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Clock size={16} className="text-forge-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-forge-muted">Timeline</p>
                    <p className="font-bold">Day 1 of {goal.duration_days}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Zap size={16} className="text-forge-green" />
                  </div>
                  <div>
                    <p className="text-xs text-forge-muted">Streak</p>
                    <p className="font-bold text-forge-green">Not started</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
