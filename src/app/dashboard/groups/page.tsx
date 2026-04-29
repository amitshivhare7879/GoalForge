'use client';

import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';

export default function GroupsPage() {
  return (
    <div className="view active" id="view-groups">
      <div className="view-header flex-between">
        <div><div className="view-h serif">Group Goals</div><div className="view-sub">Shared accountability. Collective stakes.</div></div>
        <button className="btn btn-amber"><Plus size={16} /> Create pact</button>
      </div>
      <div className="pact-card">
        <div className="pact-header">
          <div>
            <div className="pact-title">GoalForge Dev Team — Ship MVP</div>
            <div className="pact-members">4 members · 45 days · Started Apr 13</div>
          </div>
          <span className="badge badge-amber">Active</span>
        </div>
        <div className="member-avatars">
          <div className="member-av" style={{ background: 'linear-gradient(135deg,#f5a623,#fbbf4a)' }}>AS</div>
          <div className="member-av" style={{ background: 'linear-gradient(135deg,#7ba3c8,#9fc0e0)' }}>RK</div>
          <div className="member-av" style={{ background: 'linear-gradient(135deg,#4db37e,#6ed49e)' }}>PM</div>
          <div className="member-av" style={{ background: 'linear-gradient(135deg,#e05c5c,#ea8080)' }}>VJ</div>
        </div>
        <div>
          <div className="flex-between" style={{ marginBottom: 8, fontSize: 12 }}><span style={{ color: 'var(--text2)' }}>Team progress</span><span style={{ fontWeight: 600, color: 'var(--amber)' }}>67%</span></div>
          <div className="prog-track" style={{ height: 6 }}><div className="prog-fill prog-amber" style={{ width: '67%' }}></div></div>
        </div>
        <div className="pact-warning"><AlertTriangle size={14} className="shrink-0" /> If any member fails, all stakes are extended by the buffer period.</div>
      </div>
      <div className="pact-card" style={{ opacity: 0.6 }}>
        <div className="pact-header">
          <div>
            <div className="pact-title">Morning Warriors — 5AM Club</div>
            <div className="pact-members">8 members · 30 days · Completed Mar 15</div>
          </div>
          <span className="badge badge-green">Quenched</span>
        </div>
        <div className="member-avatars">
          <div className="member-av">A</div><div className="member-av">B</div><div className="member-av">C</div><div className="member-av">D</div>
          <div className="member-av" style={{ background: 'var(--surf2)', color: 'var(--text2)' }}>+4</div>
        </div>
        <div className="prog-track" style={{ height: 6, marginTop: 12 }}><div className="prog-fill prog-green" style={{ width: '100%' }}></div></div>
      </div>
    </div>
  );
}
