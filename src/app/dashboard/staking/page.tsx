'use client';

import React from 'react';
import { Lock, Check, Zap } from 'lucide-react';

export default function StakingPage() {
  return (
    <div className="view active" id="view-staking">
      <div className="view-header">
        <div className="view-h serif">Staking</div>
        <div className="view-sub">Your capital at work — earning yield while you forge.</div>
      </div>
      <div className="dash-grid">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="stake-hero">
              <div className="stake-lbl">Total locked</div>
              <div className="stake-amount serif">₹23,000</div>
              <div className="stake-status"><Lock size={12} /> Funds secured</div>
            </div>
            <div className="stake-grid">
              <div className="stake-metric">
                <div className="stake-metric-val serif" style={{ color: 'var(--green)' }}>₹184</div>
                <div className="stake-metric-lbl">Yield earned</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif">8.1%</div>
                <div className="stake-metric-lbl">Annual yield rate</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif">3</div>
                <div className="stake-metric-lbl">Active goals</div>
              </div>
              <div className="stake-metric">
                <div className="stake-metric-val serif" style={{ color: 'var(--amber)' }}>38d</div>
                <div className="stake-metric-lbl">Longest lock</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Per-goal breakdown</div>
            <div className="yield-bar-wrap">
              <div className="flex-between"><span style={{ fontSize: 13, fontWeight: 500 }}>Master DSA in 60 days</span><span style={{ fontSize: 12, color: 'var(--text2)' }}>₹5,000</span></div>
              <div className="yield-bar-track"><div className="yield-bar-fill" style={{ width: '47%' }}></div></div>
              <div className="flex-between" style={{ marginTop: 4 }}><span style={{ fontSize: 11, color: 'var(--text3)' }}>47% through lock period</span><span style={{ fontSize: 11, color: 'var(--green)' }}>+₹48 yield</span></div>
            </div>
            <div className="yield-bar-wrap">
              <div className="flex-between"><span style={{ fontSize: 13, fontWeight: 500 }}>Run 5K under 25 min</span><span style={{ fontSize: 12, color: 'var(--text2)' }}>₹3,000</span></div>
              <div className="yield-bar-track"><div className="yield-bar-fill" style={{ width: '47%', background: 'linear-gradient(90deg,var(--green),#6ed49e)' }}></div></div>
              <div className="flex-between" style={{ marginTop: 4 }}><span style={{ fontSize: 11, color: 'var(--text3)' }}>47% through lock period</span><span style={{ fontSize: 11, color: 'var(--green)' }}>+₹29 yield</span></div>
            </div>
            <div className="yield-bar-wrap">
              <div className="flex-between"><span style={{ fontSize: 13, fontWeight: 500 }}>Ship GoalForge MVP</span><span style={{ fontSize: 12, color: 'var(--text2)' }}>₹15,000</span></div>
              <div className="yield-bar-track"><div className="yield-bar-fill" style={{ width: '16%' }}></div></div>
              <div className="flex-between" style={{ marginTop: 4 }}><span style={{ fontSize: 11, color: 'var(--text3)' }}>16% through lock period</span><span style={{ fontSize: 11, color: 'var(--green)' }}>+₹107 yield</span></div>
            </div>
          </div>
        </div>

        <div>
           <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Lock timeline</div>
            <div className="timeline-steps">
              <div className="tl-step">
                <div className="tl-dot done"><Check size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title">Stake committed</div>
                  <div className="tl-sub">Apr 1, 2026 · ₹5,000 locked for DSA goal</div>
                </div>
              </div>
              <div className="tl-step">
                <div className="tl-dot done"><Check size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title">Yield begins accruing</div>
                  <div className="tl-sub">Apr 2, 2026 · 8.1% APY applied</div>
                </div>
              </div>
              <div className="tl-step">
                <div className="tl-dot active"><Zap size={11} /></div>
                <div className="tl-body">
                  <div className="tl-title" style={{ color: 'var(--amber)' }}>Goal in progress</div>
                  <div className="tl-sub">Today · Day 28 of 60 · On track</div>
                </div>
              </div>
              <div className="tl-step" style={{ paddingBottom: 0 }}>
                <div className="tl-dot future">4</div>
                <div className="tl-body">
                  <div className="tl-title">Quench & release</div>
                  <div className="tl-sub">May 31, 2026 · ₹5,048 returned (principal + yield)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ background: 'var(--amberDim2)', borderColor: 'rgba(245,166,35,.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 10 }}>Buffer day impact</div>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Using a buffer day extends the lock period by 1 day. This means more yield earned — it's a feature, not a punishment. You currently have 2 buffer days remaining.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>Manage buffer days</button>
          </div>
        </div>
      </div>
    </div>
  );
}
