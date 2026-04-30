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
    <div className="view active" id="view-dashboard">
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">
            {getGreeting()}, <em style={{ color: 'var(--amber)' }}>{firstName}.</em>
          </div>
          <div className="view-sub">
            You have {activeGoals.length} active goals and 2 tasks due today.
          </div>
        </div>
        <button className="btn btn-amber" onClick={() => router.push('/dashboard/pathfinder')}>
          <Plus size={16} /> Forge new goal
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-lbl">Active goals</div>
          <div className="stat-card-val serif" style={{ color: 'var(--amber)' }}>
            {activeGoals.length}
          </div>
          <div className="stat-card-sub up">+1 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Quenched</div>
          <div className="stat-card-val serif" style={{ color: 'var(--green)' }}>
            {completedGoals.length}
          </div>
          <div className="stat-card-sub">78% lifetime rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Stake locked</div>
          <div className="stat-card-val serif">₹{(totalStake / 1000).toFixed(0)}K</div>
          <div className="stat-card-sub up">Earning yield</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Forge Score</div>
          <div className="stat-card-val serif" style={{ color: 'var(--amber)' }}>
            {forgeScore}
          </div>
          <div className="stat-card-sub up">Top 15%</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ACTIVE GOALS */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Active goals</div>
              <span className="badge badge-amber">{activeGoals.length} live</span>
            </div>
            <div className="goal-list">
              {activeGoals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
                  No active goals. Time to forge something new?
                </div>
              ) : (
                activeGoals.map(forge => {
                  const daysActive = Math.ceil(Math.abs(new Date().getTime() - new Date(forge.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1;
                  const progress = Math.round((Math.min(daysActive, forge.duration_days) / forge.duration_days) * 100) || 2;
                  return (
                    <div key={forge.id} className="goal-card card-hover" onClick={() => router.push(`/dashboard/goals/${forge.id}`)}>
                      <div className="goal-card-header">
                        <div>
                          <div className="goal-card-title">{forge.title}</div>
                          <div className="goal-card-meta">{forge.category} · API verified · Day {daysActive} of {forge.duration_days}</div>
                        </div>
                        <span className="badge badge-steel">{forge.category?.toUpperCase()}</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill prog-amber" style={{ width: `${progress}%` }}></div>
                      </div>
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

          {/* TODAY'S TASKS */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Today's tasks</div>
              <span style={{ fontSize: '12px', color: 'var(--text2)' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="task-list">
              <div className="task-item">
                <div className="task-check"><ShieldCheck size={12} style={{ display: 'none' }} /></div>
                <div className="task-body">
                  <div className="task-name">Morning deep work session</div>
                  <div className="task-meta">Core goal · GPS will auto-verify</div>
                </div>
                <div className="task-reward">+40 pts</div>
              </div>
              <div className="task-item">
                <div className="task-check done"><ShieldCheck size={12} /></div>
                <div className="task-body done">
                  <div className="task-name">Evening review & planning</div>
                  <div className="task-meta">Discipline goal · verified 9:42 AM</div>
                </div>
                <div className="task-reward">+30 pts</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* FORGE SCORE */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '20px' }}>
              Forge Score
            </div>
            <div className="forge-score-ring">
              <svg className="forge-score-svg" width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--surf2)" strokeWidth="8" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--amber)" strokeWidth="8"
                  strokeDasharray="364" strokeDashoffset={364 - (forgeScore / 1000) * 364} strokeLinecap="round" />
              </svg>
              <div className="forge-score-text">
                <div className="forge-score-num serif">{forgeScore}</div>
                <div className="forge-score-lbl">score</div>
              </div>
            </div>
            <div className="forge-rank-pill">
              <Flame size={12} /> Journeyman
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '10px' }}>Top 15% of all users</p>
          </div>

          {/* BUFFER DAYS */}
          <div className="card">
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Buffer days</div>
            <div className="buffer-tokens">
              <div className="buffer-token" title="Available"></div>
              <div className="buffer-token" title="Available"></div>
              <div className="buffer-token used" title="Used"></div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.5 }}>
              2 of 3 remaining. Using one extends your lock period and preserves your stake.
            </p>
          </div>

          {/* CONNECTED APIS */}
          <div className="card">
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Verification APIs</div>
            <div className="verif-grid">
              <div className="verif-pill">
                <div className={`verif-dot ${profile?.github_connected ? 'connected' : 'disconnected'}`}></div>
                <div><div className="verif-name">GitHub</div><div className="verif-status">{profile?.github_connected ? 'Connected' : 'Connect'}</div></div>
              </div>
              <div className="verif-pill">
                <div className={`verif-dot ${profile?.gcal_connected ? 'connected' : 'disconnected'}`}></div>
                <div><div className="verif-name">Google Cal</div><div className="verif-status">{profile?.gcal_connected ? 'Connected' : 'Connect'}</div></div>
              </div>
              <div className="verif-pill">
                <div className={`verif-dot ${profile?.gps_connected ? 'connected' : 'disconnected'}`}></div>
                <div><div className="verif-name">GPS</div><div className="verif-status">{profile?.gps_connected ? 'Connected' : 'Connect'}</div></div>
              </div>
              <div className="verif-pill">
                <div className="verif-dot disconnected"></div>
                <div><div className="verif-name">Health</div><div className="verif-status">Connect</div></div>
              </div>
            </div>
          </div>

          {/* MINI CALENDAR */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>April 2026</div>
              <Plus size={14} style={{ color: 'var(--text3)' }} />
            </div>
            <div className="cal-grid">
              <div className="cal-head">S</div><div className="cal-head">M</div><div className="cal-head">T</div><div className="cal-head">W</div><div className="cal-head">T</div><div className="cal-head">F</div><div className="cal-head">S</div>
              {/* Dummy days to match design */}
              <div className="cal-day"></div><div className="cal-day past">1</div><div className="cal-day past">2</div><div className="cal-day past">3</div><div className="cal-day past">4</div><div className="cal-day past">5</div><div className="cal-day past">6</div>
              <div className="cal-day past">7</div><div className="cal-day past">8</div><div className="cal-day past">9</div><div className="cal-day past">10</div><div className="cal-day past">11</div><div className="cal-day past">12</div><div className="cal-day past">13</div>
              <div className="cal-day past">14</div><div className="cal-day past">15</div><div className="cal-day past">16</div><div className="cal-day past">17</div><div className="cal-day past">18</div><div className="cal-day today">19</div><div className="cal-day has-goal">20</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
