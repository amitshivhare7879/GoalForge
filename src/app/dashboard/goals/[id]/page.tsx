'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Flame, Zap, Shield, Clock, Calendar, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ForgeButton } from '@/components/ForgeButton';
import { sendNotification } from '@/components/NotificationManager';

const generateGoogleCalendarUrl = (task: string, day: number, startDate: string) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + day - 1);
  const dateStr = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent('Protocol Task from GoalForge')}`;
};

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

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('forges')
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

  const handleTaskAction = async (day: number, action: 'complete' | 'buffer') => {
    if (!goal || isUpdating) return;
    setIsUpdating(true);

    let updatedCompleted = [...(goal as any).completed_days || []];
    if (action === 'complete' && !updatedCompleted.includes(day)) {
      updatedCompleted.push(day);
    }

    const { error } = await supabase
      .from('forges')
      .update({ completed_days: updatedCompleted })
      .eq('id', goal.id);

    if (!error) {
      setGoal({ ...goal, completed_days: updatedCompleted } as any);
      if (action === 'complete') {
        sendNotification('Target Locked', `Day ${day} marked as completed.`);
      } else {
        sendNotification('Protocol Buffered', `Day ${day} intensity has been deferred.`);
      }
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-forge-amber/20 border-t-forge-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!goal) return null;

  // Calculate current day
  const start = new Date(goal.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const focusTasks = (goal as any).tasks?.filter((t: any) => 
    t.day >= currentDay - 2 && t.day <= currentDay + 2
  ) || [];

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
                <div className="flex items-center gap-3">
                   <span className="px-3 py-1 rounded-full bg-forge-amber/10 border border-forge-amber/20 text-[10px] font-bold text-forge-amber uppercase tracking-widest">
                    Day {currentDay}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-forge-muted uppercase tracking-widest">
                    {goal.status}
                  </span>
                </div>
              </div>
              
              <div className="h-48 w-full relative z-10 bg-black/40 rounded-[2rem] border border-white/5 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={goal.difficulty_curve}>
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
            </div>

            {/* Focused 5-Day Timeline */}
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Zap size={24} className="text-forge-amber" />
                  Protocol execution
                </h2>
                <div className="text-[10px] font-bold text-forge-muted uppercase tracking-widest">
                  Focus: Day {currentDay-2} to {currentDay+2}
                </div>
              </div>

              <div className="space-y-4">
                {focusTasks.map((t: any, idx: number) => {
                  const isCompleted = (goal as any).completed_days?.includes(t.day);
                  const isToday = t.day === currentDay;
                  
                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex gap-6 p-6 rounded-[2rem] border transition-all group ${
                        isToday ? 'bg-forge-amber/10 border-forge-amber/30' : 'bg-black/40 border-white/5 hover:border-white/10'
                      } ${isCompleted ? 'opacity-50 grayscale' : ''}`}
                    >
                      <div className={`h-12 w-12 shrink-0 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isToday ? 'bg-forge-amber text-black border-forge-amber' : 'bg-white/5 border-white/10 group-hover:bg-forge-amber/10 group-hover:border-forge-amber/20'
                      }`}>
                        <span className={`text-[9px] font-bold uppercase ${isToday ? 'text-black/60' : 'text-forge-muted'}`}>Day</span>
                        <span className="text-lg font-black leading-none">{t.day}</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <p className={`font-medium transition-colors ${isToday ? 'text-white' : 'text-forge-muted group-hover:text-white'}`}>
                          {t.task}
                          {isCompleted && <span className="ml-2 text-xs text-forge-green font-bold uppercase">✓ Done</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCompleted && isToday && (
                          <>
                            <ForgeButton 
                              variant="secondary" 
                              className="px-4 py-2 h-10 text-[10px] bg-forge-green/10 text-forge-green border-forge-green/20 hover:bg-forge-green hover:text-black"
                              onClick={() => handleTaskAction(t.day, 'complete')}
                              isLoading={isUpdating}
                            >
                              Complete
                            </ForgeButton>
                            <ForgeButton 
                              variant="ghost" 
                              className="px-4 py-2 h-10 text-[10px]"
                              onClick={() => handleTaskAction(t.day, 'buffer')}
                            >
                              Buffer
                            </ForgeButton>
                          </>
                        )}
                        <a 
                          href={generateGoogleCalendarUrl(t.task, t.day, goal.created_at)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-forge-muted hover:text-white"
                        >
                          <Calendar size={16} />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Verification Protocol */}
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
              <h2 className="text-2xl font-black mb-6">Verification Protocol</h2>
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-3xl bg-black/20">
                <Shield size={48} className="text-forge-muted mb-4 opacity-50" />
                <p className="text-forge-muted mb-6 text-center max-w-sm">
                  Active verification via {goal.category} is currently armed. Day {currentDay} payload pending.
                </p>
                <ForgeButton variant="ghost">Force Manual Sync</ForgeButton>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5">
               <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted mb-2">Skin In The Game</p>
               <p className="text-5xl font-black mb-4">{(goal as any).stake || '₹500'}</p>
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
                    <p className="font-bold">Day {currentDay} of {goal.duration_days}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Zap size={16} className="text-forge-green" />
                  </div>
                  <div>
                    <p className="text-xs text-forge-muted">Progress</p>
                    <p className="font-bold text-forge-green">
                      {Math.round(((goal as any).completed_days?.length || 0) / goal.duration_days * 100)}%
                    </p>
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
