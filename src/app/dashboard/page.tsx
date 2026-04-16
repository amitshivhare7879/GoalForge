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
  PlusCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import { ForgeButton } from '@/components/ForgeButton';

interface Forge {
  id: string;
  title: string;
  category: string;
  duration_days: number;
  stake: string;
  status: string;
  created_at: string;
}

interface Profile {
  forge_score: number;
  buffer_days: number;
  total_staked: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [forges, setForges] = useState<Forge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      
      if (profileData) setProfile(profileData);

      // Fetch Forges
      const { data: forgeData } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (forgeData) setForges(forgeData);
      
      setIsLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
      {/* ─── Header ─── */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-forge-amber flex items-center justify-center">
              <Flame size={18} className="text-black" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">GoalForge</span>
          </div>

          <div className="flex items-center gap-6">
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
        {/* ─── Profile Stats ─── */}
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted mb-1">Staked</p>
              <p className="text-3xl font-bold">${profile?.total_staked || 0}</p>
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <Zap className="text-forge-amber opacity-50" size={24} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted mb-1">Buffer Days</p>
              <p className="text-3xl font-bold">{profile?.buffer_days || 0}</p>
            </div>
          </div>
        </section>

        {/* ─── Active Forges ─── */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">Current Commitments</h2>
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
            {forges.map((forge, i) => (
              <motion.div 
                key={forge.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted">{forge.category}</p>
                    <h3 className="text-lg font-bold">{forge.title}</h3>
                  </div>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-forge-muted" />
                    <span className="text-xs font-medium text-forge-muted">Day 1 of {forge.duration_days}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{forge.stake}</span>
                </div>

                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-forge-amber w-[2%]" />
                </div>
              </motion.div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
