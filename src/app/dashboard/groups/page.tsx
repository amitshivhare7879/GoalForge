'use client';

import React from 'react';
import { Users, Bell } from 'lucide-react';

// FIX 3.6: Group Goals are not modelled in the schema yet.
// Removed broken 'category === Group' query and "Design Reference" div.
// Showing a proper coming-soon empty state with waitlist CTA.
export default function GroupsPage() {
  return (
    <div className="view active" id="view-groups">
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">Group Goals</div>
          <div className="view-sub">Shared accountability. Collective stakes.</div>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '64px 20px' }}>
        <div style={{
          width: '72px', height: '72px', background: 'var(--surf2)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', color: 'var(--text3)'
        }}>
          <Users size={36} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>Group Goals — Coming Soon</h3>
        <p style={{ fontSize: '14px', color: 'var(--text2)', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.7 }}>
          Forge pacts allow you to commit to goals with friends or colleagues. Shared stakes means shared success — if anyone fails, the collective buffer is drained.
          <br /><br />
          We're building multi-user accountability for a future release.
        </p>
        <button
          className="btn btn-amber"
          style={{ gap: 8 }}
          onClick={() => alert("You're on the waitlist! We'll notify you when Group Goals launch.")}
        >
          <Bell size={15} /> Join the waitlist
        </button>
      </div>
    </div>
  );
}
