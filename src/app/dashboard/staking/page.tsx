'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Check, Zap } from 'lucide-react';
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

      const { data: forgesData } = await supabase.from('forges').select('*').eq('user_id', user.id).eq('status', 'Active');
      if (forgesData) setForges(forgesData);

      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const totalLocked = forges.reduce((sum, f) => {
    const amount = parseFloat(f.stake?.replace(/[^\d.]/g, '') || '0');
    return sum + amount;
  }, 0);

  const mockYield = totalLocked * 0.008; // 0.8% total yield mock

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>Loading staking data...</div>;

  return (
    <div className="view active" id="view-staking">
      <div className="view-header">
        <div className="view-h serif">Staking</div>
        <div className="view-sub">Your capital at work — earning yield while you forge.</div>
      </div>
      <div className="dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="stake-hero">
              <div className="stake-lbl">Total locked</div>
              <div className="stake-amount serif">₹{totalLocked.toLocaleString()}</div>
              <div className="stake-status"><Lock size={12} /> Funds secured</div>
            </div>
            <div className="stake-grid">
              <div className="stake-metric">
                <div className="stake-metric-val serif" style={{ color: 'var(--green)' }}>₹{mockYield.toFixed(0)}</div>
                <div className="stake-metric-lbl">Yield earned</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif">8.1%</div>
                <div className="stake-metric-lbl">Annual yield rate</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif">{forges.length}</div>
                <div className="stake-metric-lbl">Active goals</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif" style={{ color: 'var(--amber)' }}>
                  {forges.length > 0 ? Math.max(...forges.map(f => f.duration_days)) : 0}d
                </div>
                <div className="stake-metric-lbl">Longest lock</div>
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
                const earned = stakeValue * 0.001 * daysActive; // 0.1% daily yield mock

                return (
                  <div key={forge.id} className="yield-bar-wrap">
                    <div className="flex-between">
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{forge.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text2)' }}>₹{stakeValue.toLocaleString()}</span>
                    </div>
                    <div className="yield-bar-track"><div className="yield-bar-fill" style={{ width: `${progress}%` }}></div></div>
                    <div className="flex-between" style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{progress}% through lock period</span>
                      <span style={{ fontSize: '11px', color: 'var(--green)' }}>+₹{earned.toFixed(0)} yield</span>
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
                  <div className="tl-sub">Protocol initialized security deposit</div>
                </div>
              </div>
              <div className="tl-step">
                <div className="tl-dot done"><Check size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title">Yield begins accruing</div>
                  <div className="tl-sub">8.1% APY applied to all locked capital</div>
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
                  <div className="tl-title">Quench & release</div>
                  <div className="tl-sub">Principal + earned yield returned on success</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ background: 'var(--amberDim2)', borderColor: 'rgba(245,166,35,.15)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '10px' }}>Buffer day impact</div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>Using a buffer day extends the lock period by 1 day. This means more yield earned — it's a feature, not a punishment. You currently have {profile?.buffer_days || 0} buffer days remaining.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>Manage buffer days</button>
          </div>
        </div>
      </div>
    </div>
  );
}
