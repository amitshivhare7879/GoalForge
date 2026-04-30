'use client';

import React from 'react';
import { Hammer } from 'lucide-react';

export default function ForgeScorePage() {
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
            <div className="score-big">780</div>
            <div className="score-rank">Journeyman · Top 15% of all users</div>
            <div className="forge-rank-pill"><Hammer size={12} /> 220 points to Master</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Score breakdown</div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Completion rate</span><span className="breakdown-val">78%</span></div>
              <div className="prog-track"><div className="prog-fill prog-amber" style={{ width: '78%' }}></div></div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Stake consistency</span><span className="breakdown-val">85%</span></div>
              <div className="prog-track"><div className="prog-fill prog-steel" style={{ width: '85%' }}></div></div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Passive verifications</span><span className="breakdown-val">92%</span></div>
              <div className="prog-track"><div className="prog-fill prog-green" style={{ width: '92%' }}></div></div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-header"><span className="breakdown-name">Streak bonus</span><span className="breakdown-val">+40pts</span></div>
              <div className="prog-track"><div className="prog-fill prog-amber" style={{ width: '40%' }}></div></div>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Rank ladder</div>
            <div className="rank-ladder">
              <div className="rank-item"><div className="rank-icon" style={{ background: 'var(--amberDim)', fontSize: '16px' }}>🪨</div><div className="rank-name">Apprentice</div><div className="rank-range">0–299</div></div>
              <div className="rank-item"><div className="rank-icon" style={{ background: 'var(--steelDim)', fontSize: '16px' }}>⚒️</div><div className="rank-name">Craftsman</div><div className="rank-range">300–599</div></div>
              <div className="rank-item current"><div className="rank-icon" style={{ background: 'var(--amberDim)', fontSize: '16px' }}>🔨</div><div className="rank-name">Journeyman</div><div className="rank-range">600–999</div></div>
              <div className="rank-item"><div className="rank-icon" style={{ background: 'rgba(255,255,255,.04)', fontSize: '16px' }}>⚡</div><div className="rank-name">Master</div><div className="rank-range">1000–1499</div></div>
              <div className="rank-item"><div className="rank-icon" style={{ background: 'rgba(255,255,255,.04)', fontSize: '16px' }}>🏆</div><div className="rank-name">Grandmaster</div><div className="rank-range">1500+</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
