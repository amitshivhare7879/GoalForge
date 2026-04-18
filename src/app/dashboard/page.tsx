'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Flame, 
  Plus, 
  Settings, 
  LogOut, 
  Zap, 
  Shield, 
  Activity,
  Cpu,
  PlusCircle,
  Clock,
  MoreVertical,
  Calendar,
  Bell,
  MapPin,
  Smartphone
} from 'lucide-react';
import { ForgeButton } from '@/components/ForgeButton';
import { NotificationManager, sendNotification } from '@/components/NotificationManager';

interface Forge {
  id: string;
  title: string;
  category: string;
  duration_days: number;
  stake_amount: string;
  status: string;
  buffer_days_used: number;
  created_at: string;
}

interface Profile {
  forge_score: number;
  streak_days: number;
  completed_goals: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [forges, setForges] = useState<Forge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [view, setView] = useState<'goals' | 'calendar' | 'settings'>('goals');
  const [handles, setHandles] = useState({
    github: '',
    hashnode: '',
    linkedin: '',
    twitter: '',
    leetcode: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<{title: string, body: string, time: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setHandles({
          github: profileData.github_handle || '',
          hashnode: profileData.hashnode_handle || '',
          linkedin: profileData.linkedin_handle || '',
          twitter: profileData.twitter_handle || '',
          leetcode: profileData.leetcode_handle || ''
        });
      }

      // Fetch Goals
      const { data: goalData } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (goalData) setForges(goalData as any);
      
      setIsLoading(false);
    };

    const handleSignal = (e: any) => {
      setNotificationHistory(prev => [{
        title: e.detail.title,
        body: e.detail.body,
        time: e.detail.time
      }, ...prev].slice(0, 10));
    };

    window.addEventListener('forge-signal', handleSignal);
    fetchData();

    return () => window.removeEventListener('forge-signal', handleSignal);
  }, [router, supabase]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          github_handle: handles.github,
          hashnode_handle: handles.hashnode,
          linkedin_handle: handles.linkedin,
          twitter_handle: handles.twitter,
          leetcode_handle: handles.leetcode,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Verification Step: Refetch to ensure it's in the DB
      const { data: verifiedData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (verifiedData) {
        setHandles({
          github: verifiedData.github_handle || '',
          hashnode: verifiedData.hashnode_handle || '',
          linkedin: verifiedData.linkedin_handle || '',
          twitter: verifiedData.twitter_handle || '',
          leetcode: verifiedData.leetcode_handle || ''
        });
      }

      sendNotification('Integrations Secured', 'Auto-verification protocols are now armed and verified.');
    } catch (err: any) {
      console.error('Settings save error:', err);
      sendNotification('Save Failed', err.message || 'System refusal. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getProgress = (forge: any) => {
    const total = forge.duration_days;
    const completed = forge.completed_days?.length || 0;
    return Math.round((completed / total) * 100) || 2;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-forge-amber/20 border-t-forge-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans">
      <NotificationManager />
      {/* Header */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-8 w-8 rounded-lg bg-forge-amber flex items-center justify-center" suppressHydrationWarning>
              <Flame size={18} className="text-black" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">GoalForge</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
              >
                <Bell size={20} className="text-forge-muted" />
                {notificationHistory.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-forge-amber rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 z-[100] shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest">Protocol Alerts</h4>
                  </div>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {notificationHistory.length === 0 ? (
                      <p className="text-xs text-forge-muted text-center py-8 italic">No signals detected.</p>
                    ) : (
                      notificationHistory.map((n, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-xs font-bold text-forge-amber mb-1">{n.title}</p>
                          <p className="text-[10px] text-forge-muted leading-relaxed">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex bg-white/5 rounded-full p-1 border border-white/10">
              <button 
                onClick={() => setView('goals')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'goals' ? 'bg-forge-amber text-black' : 'text-forge-muted hover:text-white'}`}
              >
                Goals
              </button>
              <button 
                onClick={() => setView('calendar')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-forge-amber text-black' : 'text-forge-muted hover:text-white'}`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setView('settings')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'settings' ? 'bg-forge-amber text-black' : 'text-forge-muted hover:text-white'}`}
              >
                <Settings size={14} />
              </button>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-xs font-bold text-forge-muted hover:text-white transition-all uppercase tracking-widest"
            >
              Sign Out
            </button>
            <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
               <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=FF8C00&color=000`} alt="Profile" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Active Protocols */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-forge-amber mb-6">Integrity Protocol</p>
              <h1 className="text-6xl font-black tracking-tighter mb-2">{profile?.forge_score || 0}</h1>
              <p className="text-sm font-medium text-forge-muted">Forge Score. Your verified reputation in the network.</p>
            </div>
            <div className="absolute top-0 right-0 h-full w-1/2 bg-forge-amber/5 blur-[100px] rounded-full pointer-events-none" />
          </motion.div>

          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <Shield className="text-forge-green opacity-50" size={24} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted mb-1">Completed</p>
              <p className="text-3xl font-bold">{forges.filter(f => f.status === 'Forged').length}</p>
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <Zap className="text-forge-amber opacity-50" size={24} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted mb-1">Active</p>
              <p className="text-3xl font-bold">{forges.length}</p>
            </div>
          </div>
        </section>

        {view === 'goals' ? (
          <>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold italic tracking-tight uppercase">Current Commitments</h2>
              <ForgeButton variant="primary" className="h-11 px-6 text-xs" onClick={() => router.push('/pathfinder')}>
                <Plus size={16} className="mr-2" />
                New Forge
              </ForgeButton>
            </div>

            {forges.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-[3rem]"
              >
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-forge-muted mb-6">
                  <PlusCircle size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">No active forges</h3>
                <p className="text-forge-muted max-w-sm mb-10">You haven't initiated any commitment protocols yet. Your discipline is currently unverified.</p>
                <ForgeButton onClick={() => router.push('/pathfinder')}>
                  Initialize First Goal
                </ForgeButton>
              </motion.div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forges.map((forge: any, i) => (
                  <motion.div 
                    key={forge.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/dashboard/goals/${forge.id}`)}
                  >
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all h-full">
                      <div className="flex justify-between items-start mb-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted">{forge.category}</p>
                          <h3 className="text-lg font-bold group-hover:text-forge-amber transition-colors">{forge.title}</h3>
                        </div>
                      </div>
     
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <Clock size={14} className="text-forge-muted" />
                          <span className="text-xs font-medium text-forge-muted">
                            Day {Math.ceil(Math.abs(new Date().getTime() - new Date(forge.created_at).getTime()) / (1000 * 60 * 60 * 24))} of {forge.duration_days}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-forge-amber">{forge.stake || '₹500'}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] text-forge-muted uppercase tracking-widest font-black">Buffer Status</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${forge.buffer_days_used > 0 ? 'text-forge-amber' : 'text-forge-green hover:opacity-50'}`}>
                          {forge.buffer_days_used || 0} Days Used
                        </p>
                      </div>

                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress(forge)}%` }}
                          className="h-full bg-forge-amber" 
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </section>
            )}
          </>
        ) : view === 'calendar' ? (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold italic tracking-tight uppercase">Commitment Calendar</h2>
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
               <div className="grid grid-cols-7 gap-4 mb-8">
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                   <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-forge-muted">{d}</div>
                 ))}
                 {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - 3 + i); 
                    const isToday = i === 3;
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Find tasks for this date from all active forges
                    const daysTasks: {goal: string, task: string, color: string}[] = [];
                    forges.forEach(f => {
                       const start = new Date(f.created_at);
                       const diff = Math.ceil(Math.abs(date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
                       const taskObj = (f as any).tasks?.find((t: any) => t.day === diff);
                       if (taskObj) {
                         daysTasks.push({ goal: f.title, task: taskObj.task, color: 'bg-forge-amber/20 text-forge-amber' });
                       }
                    });

                    return (
                      <div key={i} className={`h-40 rounded-3xl border transition-all flex flex-col p-4 overflow-hidden ${isToday ? 'bg-forge-amber/10 border-forge-amber/30' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex justify-between items-center mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-forge-amber' : 'text-forge-muted'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })} {date.getDate()}
                          </span>
                          {isToday && <span className="h-1.5 w-1.5 rounded-full bg-forge-amber" />}
                        </div>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                          {daysTasks.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                               <p className="text-[10px] text-forge-muted/30 italic">Clear</p>
                            </div>
                          ) : (
                            daysTasks.map((t, idx) => (
                              <div key={idx} className={`p-2 rounded-xl border border-white/5 bg-white/5 text-[9px] font-medium leading-tight`}>
                                <span className="text-forge-amber font-bold block mb-1 truncate">{t.goal}</span>
                                {t.task}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                 })}
               </div>
               <p className="text-center text-xs text-forge-muted">Heatmap reflects daily commitment density across all active protocols.</p>
            </div>
          </section>
        ) : (
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold italic tracking-tight uppercase">Verification Gateways</h2>
              <ForgeButton onClick={handleSaveSettings} isLoading={isSaving} className="px-8">
                Save Integrations
              </ForgeButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'github', label: 'GitHub Handle', desc: 'Auto-verify coding commits & PRs', icon: <Cpu size={20} />, placeholder: 'e.g. amitshivhare' },
                { id: 'hashnode', label: 'Hashnode Handle', desc: 'Auto-verify blog posts & writing', icon: <Activity size={20} />, placeholder: 'e.g. amit' },
                { id: 'linkedin', label: 'LinkedIn URL', desc: 'Verify professional visibility', icon: <Shield size={20} />, placeholder: 'e.g. linkedin.com/in/amit' },
                { id: 'twitter', label: 'Twitter Handle', desc: 'Verify public accountability posts', icon: <Zap size={20} />, placeholder: 'e.g. @amit' },
                { id: 'leetcode', label: 'LeetCode Username', desc: 'Auto-verify daily problem solving', icon: <Flame size={20} />, placeholder: 'e.g. amit_99' },
                { id: 'location', label: 'Target Location', desc: 'Verify you were at a specific spot', icon: <MapPin size={20} />, placeholder: 'e.g. Gym, Office' }
              ].map((platform) => (
                <div key={platform.id} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-forge-muted group-hover:bg-forge-amber/10 group-hover:text-forge-amber transition-all">
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-bold">{platform.label}</h4>
                      <p className="text-[10px] text-forge-muted uppercase tracking-widest">{platform.desc}</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={(handles as any)[platform.id]}
                    onChange={(e) => setHandles({ ...handles, [platform.id]: e.target.value })}
                    placeholder={platform.placeholder}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm outline-none focus:border-forge-amber/50 transition-all font-medium"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
