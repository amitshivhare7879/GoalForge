'use client';

import React from 'react';

export default function HistoryPage() {
  return (
    <div className="view active" id="view-history">
      <div className="view-header"><div className="view-h serif">History</div><div className="view-sub">37 goals quenched. Every one hardened you.</div></div>
      <div className="card">
        <div className="goal-list">
          <div className="goal-card" style={{ cursor: 'default', borderLeft: '3px solid var(--green)' }}>
            <div className="goal-card-header">
              <div><div className="goal-card-title">Read Clean Code by Robert Martin</div><div className="goal-card-meta">Skill · Completed Mar 20, 2026 · 21 days</div></div>
              <span className="badge badge-green">Quenched</span>
            </div>
            <div className="prog-track"><div className="prog-fill prog-green" style={{ width: '100%' }}></div></div>
            <div className="goal-card-footer"><span className="goal-prog-label">100% complete · ₹2,000 returned + ₹14 yield</span><span style={{ fontSize: 12, color: 'var(--green)' }}>+120 pts</span></div>
          </div>
          <div className="goal-card" style={{ cursor: 'default', borderLeft: '3px solid var(--green)' }}>
            <div className="goal-card-header">
              <div><div className="goal-card-title">Wake up at 5AM for 30 days</div><div className="goal-card-meta">Habit · Completed Feb 28, 2026 · 30 days</div></div>
              <span className="badge badge-green">Quenched</span>
            </div>
            <div className="prog-track"><div className="prog-fill prog-green" style={{ width: '100%' }}></div></div>
            <div className="goal-card-footer"><span className="goal-prog-label">100% complete · ₹3,500 returned + ₹23 yield</span><span style={{ fontSize: 12, color: 'var(--green)' }}>+180 pts</span></div>
          </div>
          <div className="goal-card" style={{ cursor: 'default', borderLeft: '3px solid var(--red)' }}>
            <div className="goal-card-header">
              <div><div className="goal-card-title">No social media for 14 days</div><div className="goal-card-meta">Habit · Failed Feb 10, 2026 · 8/14 days</div></div>
              <span className="badge badge-red">Failed</span>
            </div>
            <div className="prog-track"><div className="prog-fill" style={{ width: '57%', background: 'var(--red)' }}></div></div>
            <div className="goal-card-footer"><span className="goal-prog-label">57% complete · ₹1,000 forfeited</span><span style={{ fontSize: 12, color: 'var(--red)' }}>-40 pts</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
