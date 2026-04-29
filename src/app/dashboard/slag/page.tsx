'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SlagPage() {
  return (
    <div className="view active" id="view-slag">
      <div className="view-header"><div className="view-h serif">Slag Heap</div><div className="view-sub">Goals that didn't make it. Learn, adapt, return stronger.</div></div>
      <div style={{ background: 'var(--redDim)', border: '1px solid rgba(224,92,92,.15)', borderRadius: 'var(--rlg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <AlertTriangle size={16} className="text-red-500 shrink-0" />
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>4 goals in the slag heap. The AI will analyze patterns and suggest improvements when you set similar goals.</p>
      </div>
      <div className="slag-card">
        <div className="slag-title">No social media for 14 days</div>
        <div className="slag-meta">Failed · Feb 10, 2026 · Day 8 of 14 · ₹1,000 forfeited</div>
        <div className="slag-lesson"><strong>AI analysis:</strong> Habit goals under 14 days rarely form lasting change. The stake was too low (₹71/day) to create meaningful discomfort. Recommend: 30-day version with ₹150/day stake minimum.</div>
      </div>
      <div className="slag-card">
        <div className="slag-title">Launch a YouTube channel in 7 days</div>
        <div className="slag-meta">Failed · Jan 15, 2026 · Day 3 of 7 · ₹2,000 forfeited</div>
        <div className="slag-lesson"><strong>AI analysis:</strong> Creative goals flagged as severely under-scoped at intake but user proceeded. 7 days is insufficient for a launch. The AI Pathfinder would now block this without a scope renegotiation.</div>
      </div>
    </div>
  );
}
