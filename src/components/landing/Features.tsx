'use client';

import React from 'react';
import { Brain, ShieldCheck, TrendingUp, Coins, CalendarCheck, Users } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Brain style={{ width: 20, height: 20, color: 'var(--amber)' }} />,
      iconClass: 'feat-icon-amber',
      title: 'Goal intelligence, not templates',
      desc: 'The AI understands that a fitness goal and a coding goal need completely different intensity curves, timelines, and milestones.'
    },
    {
      icon: <ShieldCheck style={{ width: 20, height: 20, color: 'var(--steel)' }} />,
      iconClass: 'feat-icon-steel',
      title: 'Passive verification',
      desc: 'Connected to GitHub, Google Calendar, GPS geofencing, and Health APIs. Your progress is confirmed automatically — not self-reported.'
    },
    {
      icon: <TrendingUp style={{ width: 20, height: 20, color: 'var(--green)' }} />,
      iconClass: 'feat-icon-green',
      title: 'Forge Score — public reputation',
      desc: 'A discipline rating that compounds over time. Not hidden badges — a real, public signal of how serious you are about what you commit to.'
    },
    {
      icon: <Coins style={{ width: 20, height: 20, color: 'var(--amber)' }} />,
      iconClass: 'feat-icon-amber',
      title: 'Yield-protocol staking',
      desc: 'Your locked stake earns yield while you work. Succeed and get back more than you put in. Fail and it funds accountability, not charity.'
    },
    {
      icon: <CalendarCheck style={{ width: 20, height: 20, color: 'var(--steel)' }} />,
      iconClass: 'feat-icon-steel',
      title: 'Buffer days built-in',
      desc: 'Life happens. Each goal comes with buffer days — use one and the lock period extends, maintaining both flexibility and accountability.'
    },
    {
      icon: <Users style={{ width: 20, height: 20, color: 'var(--green)' }} />,
      iconClass: 'feat-icon-green',
      title: 'Group forge pacts',
      desc: 'Commit with a team. Shared stakes, shared accountability. If the group succeeds, everyone wins. Peer pressure, productively applied.'
    }
  ];

  return (
    <>
      <section className="l-how">
        <div className="l-section-label">The process</div>
        <h2 className="l-section-h2 serif">The Path of the Forge</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-num serif">1</div>
            <div className="how-step-h">AI Pathfinder</div>
            <p className="how-step-p">Describe your goal. The AI validates your timeline, classifies it, and builds a realistic difficulty curve.</p>
          </div>
          <div className="how-step">
            <div className="how-num serif">2</div>
            <div className="how-step-h">Commit your stake</div>
            <p className="how-step-p">Lock a meaningful amount. Not punitive — it's returned on success with yield earned during the lock period.</p>
          </div>
          <div className="how-step">
            <div className="how-num serif">3</div>
            <div className="how-step-h">Passive verification</div>
            <p className="how-step-p">GitHub, Google Calendar, GPS, and Health APIs automatically confirm progress — no manual check-ins.</p>
          </div>
          <div className="how-step">
            <div className="how-num serif">4</div>
            <div className="how-step-h">The Quench</div>
            <p className="how-step-p">Goal achieved. Stake returned. Forge Score updated. A cinematic moment for every hard-won completion.</p>
          </div>
        </div>
      </section>

      <section className="l-features">
        <div className="l-section-label">What makes GoalForge different</div>
        <h2 className="l-section-h2 serif">Built for people who are<br />serious about this time</h2>
        <div className="grid3">
          {features.map((f, i) => (
            <div className="feat-card" key={i}>
              <div className={`feat-icon ${f.iconClass}`}>{f.icon}</div>
              <div className="feat-h">{f.title}</div>
              <p className="feat-p">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
