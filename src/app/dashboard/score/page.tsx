'use client';

import React, { useState, useEffect } from 'react';
import { Hammer, Trophy, Zap, Shield, Award, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ForgeScorePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ completionRate: 0, consistency: 0, verifiedRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      const { data: forgesData } = await supabase.from('forges').select('*').eq('user_id', user.id);
      if (forgesData && forgesData.length > 0) {
        const completed = forgesData.filter(f => f.status === 'Forged').length;
        const failed = forgesData.filter(f => f.status === 'Broken').length;
        const total = completed + failed || 1;
        setStats({
          completionRate: Math.round((completed / total) * 100),
          consistency: Math.round((completed / (completed + failed + 1)) * 100),
          verifiedRate: 85 // Mock for now until logs are counted
        });
      }

      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const getRank = (score: number) => {
    if (score < 300) return { name: 'Apprentice', icon: <Shield size={20} />, next: 300 - score };
    if (score < 600) return { name: 'Craftsman', icon: <Hammer size={20} />, next: 600 - score };
    if (score < 1000) return { name: 'Journeyman', icon: <Award size={20} />, next: 1000 - score };
    if (score < 1500) return { name: 'Master', icon: <Zap size={20} />, next: 1500 - score };
    return { name: 'Grandmaster', icon: <Trophy size={20} />, next: 0 };
  };

  const rank = getRank(profile?.forge_score || 0);

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>Loading score data...</div>;

  return (
    <div className="view active" id="view-forge-score">
      <div className="view-header">
        <div className="view-h serif">Forge Score</div>
        <div className="view-sub">Your public discipline reputation.</div>
      </div>
      <div className="dash-grid">
        <div>
          <div className="card" style={{ marginBottom: '20px', textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '12px' }}>Your current score</div>
            <div className="score-big">{profile?.forge_score || 0}</div>
            <div className="score-rank">{rank.name} · Calculated from {profile?.forge_score || 0} discipline points</div>
            {rank.next > 0 && (
              <div className="forge-rank-pill"><Hammer size={12} /> {rank.next} points to next rank</div>
            )}
          </div>
          <div className="card">
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Score breakdown</div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Completion rate</span><span className="breakdown-val">{stats.completionRate}%</span></div>
              <div className="prog-track"><div className="prog-fill prog-amber" style={{ width: `${stats.completionRate}%` }}></div></div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Stake consistency</span><span className="breakdown-val">{stats.consistency}%</span></div>
              <div className="prog-track"><div className="prog-fill prog-steel" style={{ width: `${stats.consistency}%` }}></div></div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Passive verifications</span><span className="breakdown-val">{stats.verifiedRate}%</span></div>
              <div className="prog-track"><div className="prog-fill prog-green" style={{ width: `${stats.verifiedRate}%` }}></div></div>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Rank ladder</div>
            <div className="rank-ladder">
              <div className={`rank-item ${rank.name === 'Apprentice' ? 'current' : ''}`}><div className="rank-icon" style={{ background: 'var(--amberDim)', color: 'var(--amber)' }}><Shield size={16} /></div><div className="rank-name">Apprentice</div><div className="rank-range">0–299</div></div>
              <div className={`rank-item ${rank.name === 'Craftsman' ? 'current' : ''}`}><div className="rank-icon" style={{ background: 'var(--steelDim)', color: 'var(--steel)' }}><Hammer size={16} /></div><div className="rank-name">Craftsman</div><div className="rank-range">300–599</div></div>
              <div className={`rank-item ${rank.name === 'Journeyman' ? 'current' : ''}`}><div className="rank-icon" style={{ background: 'var(--amberDim)', color: 'var(--amber)' }}><Award size={16} /></div><div className="rank-name">Journeyman</div><div className="rank-range">600–999</div></div>
              <div className={`rank-item ${rank.name === 'Master' ? 'current' : ''}`}><div className="rank-icon" style={{ background: 'rgba(255,255,255,.04)', color: 'var(--text2)' }}><Zap size={16} /></div><div className="rank-name">Master</div><div className="rank-range">1000–1499</div></div>
              <div className={`rank-item ${rank.name === 'Grandmaster' ? 'current' : ''}`}><div className="rank-icon" style={{ background: 'rgba(255,255,255,.04)', color: 'var(--amber)' }}><Trophy size={16} /></div><div className="rank-name">Grandmaster</div><div className="rank-range">1500+</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
