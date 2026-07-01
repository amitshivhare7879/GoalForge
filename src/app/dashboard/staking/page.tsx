'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Check, Zap, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function StakingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [forges, setForges] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // FIX M-01: query both 'Active' and 'active' to avoid missing goals
      const { data: forgesData } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['Active', 'active']);
      if (forgesData) setForges(forgesData);

      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const totalLocked = forges.reduce((sum, f) => {
    const amount = parseFloat(f.stake?.replace(/[^\d.]/g, '') || '0');
    return sum + amount;
  }, 0);

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>Loading staking data...</div>;

  return (
    <div className="view active" id="view-staking">
      <div className="view-header">
        <div className="view-h serif">Staking</div>
        <div className="view-sub">Your committed stakes — locked while you forge.</div>
      </div>

      {/* FIX 2.3: Prominent "Simulated — Demo Only" disclaimer */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px',
        padding: '14px 18px', borderRadius: 'var(--rlg)',
        background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)'
      }}>
        <AlertTriangle size={18} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)', marginBottom: 3 }}>
            Simulated — Demo Only
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>
            Staking and yield mechanics shown here are for demonstration purposes only. No real money is moved, held, or invested. Stake amounts represent accountability commitments, not financial instruments.
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="stake-hero">
              <div className="stake-lbl">Total committed stake</div>
              <div className="stake-amount serif">₹{totalLocked.toLocaleString()}</div>
              <div className="stake-status"><Lock size={12} /> Accountability lock active</div>
            </div>
            <div className="stake-grid">
              <div className="stake-metric">
                {/* FIX 2.3: Show goal count instead of fake yield numbers */}
                <div className="stake-metric-val serif" style={{ color: 'var(--green)' }}>{forges.length}</div>
                <div className="stake-metric-lbl">Active goals</div>
              </div>
              <div className="stake-metric">
                {/* FIX 2.3: Label clearly as projected / illustrative */}
                <div className="stake-metric-val serif">8.1%</div>
                <div className="stake-metric-lbl">Projected APY (illustrative)</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif" style={{ color: 'var(--amber)' }}>
                  {forges.length > 0 ? Math.max(...forges.map(f => f.duration_days)) : 0}d
                </div>
                <div className="stake-metric-lbl">Longest lock</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif">
                  {profile?.buffer_days ?? 2}
                </div>
                <div className="stake-metric-lbl">Buffer days</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Per-goal breakdown</div>
            {forges.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text3)', textAlign: 'center', padding: '20px' }}>No active stakes found.</p>
            ) : (
              forges.map(forge => {
                const daysActive = Math.ceil(Math.abs(new Date().getTime() - new Date(forge.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1;
                const progress = Math.min(Math.round((daysActive / forge.duration_days) * 100), 100);
                const stakeValue = parseFloat(forge.stake?.replace(/[^\d.]/g, '') || '0');

                return (
                  <div key={forge.id} className="yield-bar-wrap">
                    <div className="flex-between">
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{forge.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text2)' }}>₹{stakeValue.toLocaleString()}</span>
                    </div>
                    <div className="yield-bar-track"><div className="yield-bar-fill" style={{ width: `${progress}%` }}></div></div>
                    <div className="flex-between" style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{progress}% through lock period · Day {daysActive} of {forge.duration_days}</span>
                      {/* FIX 2.3: No fake ₹ yield numbers — show percentage progress only */}
                      <span style={{ fontSize: '11px', color: 'var(--amber)' }}>Active</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Lock timeline</div>
            <div className="timeline-steps">
              <div className="tl-step">
                <div className="tl-dot done"><Check size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title">Stake committed</div>
                  <div className="tl-sub">Protocol initialized accountability deposit</div>
                </div>
              </div>
              <div className="tl-step">
                <div className="tl-dot done"><Check size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title">Verification begins</div>
                  <div className="tl-sub">Daily proof-of-work tracking active</div>
                </div>
              </div>
              <div className="tl-step">
                <div className="tl-dot active"><Zap size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title" style={{ color: 'var(--amber)' }}>Goal in progress</div>
                  <div className="tl-sub">Today · Verification phase active</div>
                </div>
              </div>
              <div className="tl-step" style={{ paddingBottom: 0 }}>
                <div className="tl-dot future">4</div>
                <div className="tl-body">
                  <div className="tl-title">Quench &amp; release</div>
                  <div className="tl-sub">Stake returned on verified completion</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ background: 'var(--amberDim2)', borderColor: 'rgba(245,166,35,.15)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '10px' }}>Buffer day impact</div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>Using a buffer day extends the lock period by 1 day. You currently have <strong>{profile?.buffer_days ?? 2}</strong> buffer days remaining.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>Manage buffer days</button>
          </div>
        </div>
      </div>
    </div>
  );
}
