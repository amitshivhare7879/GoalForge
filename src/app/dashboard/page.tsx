'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Flame, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [forges, setForges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      const { data: forgesData } = await supabase.from('forges').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (forgesData) setForges(forgesData);

      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const activeGoals = forges.filter(f => f.status === 'Active');
  const completedGoals = forges.filter(f => f.status === 'Forged');
  const totalStake = forges.reduce((sum, f) => sum + (parseFloat(f.stake) || 0), 0);
  const forgeScore = profile?.forge_score || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Forger';

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>Loading dashboard...</div>;

  return (
    <>
      {/* GREETING */}
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">{getGreeting()}, <em style={{ color: 'var(--amber)' }}>{firstName}.</em></div>
          <div className="view-sub">You have {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''} and {completedGoals.length} completed.</div>
        </div>
        <button className="btn btn-amber" onClick={() => router.push('/dashboard/pathfinder')}>
          <Plus size={16} /> Forge new goal
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-lbl">Active Goals</div>
          <div className="stat-card-val serif" style={{ color: 'var(--amber)' }}>{activeGoals.length}</div>
          <div className="stat-card-sub up">tracking</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Completed</div>
          <div className="stat-card-val serif" style={{ color: 'var(--green)' }}>{completedGoals.length}</div>
          <div className="stat-card-sub">lifetime</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Stake Locked</div>
          <div className="stat-card-val serif">₹{totalStake.toLocaleString()}</div>
          <div className="stat-card-sub">total committed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Forge Score</div>
          <div className="stat-card-val serif" style={{ color: 'var(--amber)' }}>{forgeScore}</div>
          <div className="stat-card-sub">discipline rating</div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="dash-grid">
        {/* ACTIVE GOALS */}
        <div>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Active goals</span>
              <span className="badge badge-amber">{activeGoals.length} live</span>
            </div>
            <div className="goal-list">
              {activeGoals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
                  No active goals yet. Start forging!
                </div>
              ) : (
                activeGoals.map(forge => {
                  const daysActive = Math.ceil(Math.abs(new Date().getTime() - new Date(forge.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1;
                  const progress = Math.round((Math.min(daysActive, forge.duration_days) / forge.duration_days) * 100) || 2;
                  return (
                    <div key={forge.id} className="goal-card">
                      <div className="goal-card-header">
                        <div>
                          <div className="goal-card-title">{forge.title}</div>
                          <div className="goal-card-meta">{forge.category} · Day {daysActive} of {forge.duration_days}</div>
                        </div>
                        <span className="badge badge-amber">{forge.category?.toUpperCase()}</span>
                      </div>
                      <div className="prog-track"><div className="prog-fill prog-amber" style={{ width: `${progress}%` }}></div></div>
                      <div className="goal-card-footer">
                        <span className="goal-prog-label">{progress}% complete · {Math.max(0, forge.duration_days - daysActive)} days left</span>
                        <span className="goal-prog-val">₹{forge.stake || 0} staked</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* FORGE SCORE RING */}
          <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>Forge Score</div>
            <div className="forge-score-ring">
              <svg className="forge-score-svg" width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--surf2)" strokeWidth="8" />
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--amber)" strokeWidth="8"
                  strokeDasharray={`${(forgeScore / 1500) * 377} 377`} strokeLinecap="round" />
              </svg>
              <div className="forge-score-text">
                <div className="forge-score-num">{forgeScore}</div>
                <div className="forge-score-lbl">Score</div>
              </div>
            </div>
            <div className="forge-rank-pill"><Flame size={12} /> Journeyman</div>
          </div>

          {/* VERIFICATION APIS */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Verification APIs</div>
            <div className="verif-grid">
              <div className="verif-pill">
                <div className={`verif-dot ${profile?.github_connected ? 'connected' : 'disconnected'}`}></div>
                <div><div className="verif-name">GitHub</div><div className="verif-status">{profile?.github_connected ? 'Connected' : 'Not connected'}</div></div>
              </div>
              <div className="verif-pill">
                <div className={`verif-dot ${profile?.gcal_connected ? 'connected' : 'disconnected'}`}></div>
                <div><div className="verif-name">Google Calendar</div><div className="verif-status">{profile?.gcal_connected ? 'Connected' : 'Not connected'}</div></div>
              </div>
              <div className="verif-pill">
                <div className={`verif-dot ${profile?.gps_connected ? 'connected' : 'disconnected'}`}></div>
                <div><div className="verif-name">GPS</div><div className="verif-status">{profile?.gps_connected ? 'Connected' : 'Not connected'}</div></div>
              </div>
              <div className="verif-pill">
                <div className="verif-dot disconnected"></div>
                <div><div className="verif-name">Health Connect</div><div className="verif-status">Not connected</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
