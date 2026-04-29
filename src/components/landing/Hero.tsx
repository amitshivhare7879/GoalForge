'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Award, GitCommit, Shield } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();
  const [stats, setStats] = useState({ completionRate: '94%', locked: '₹2.1Cr', forged: '12K+' });

  useEffect(() => {
    // In a real app, this would fetch from /api/stats
    // fetch('/api/stats').then(res => res.json()).then(data => setStats(data));
  }, []);

  return (
    <section className="l-hero">
      <div>
        <div className="l-hero-eyebrow">
          <div className="l-eyebrow-line"></div>
          <span className="l-eyebrow-text">AI-powered accountability</span>
        </div>
        <h1 className="l-hero-h1 serif">Stop Dreaming.<br /><em>Start Forging.</em></h1>
        <p className="l-hero-sub">GoalForge turns vague intentions into verifiable commitments — with AI personalization, passive API verification, and real financial skin in the game.</p>
        <div className="l-hero-cta">
          <Button variant="amber" size="lg" onClick={() => router.push('/signup')} leftIcon={<Zap style={{ width: 18, height: 18 }} />}>
            Forge my first goal
          </Button>
          <Button variant="ghost" size="lg" onClick={() => router.push('/dashboard')}>
            See dashboard
          </Button>
        </div>
        <div className="l-hero-stats">
          <div>
            <div className="l-stat-val serif">{stats.completionRate}</div>
            <div className="l-stat-lbl">completion rate vs 20% industry avg</div>
          </div>
          <div>
            <div className="l-stat-val serif">{stats.locked}</div>
            <div className="l-stat-lbl">stakes locked and returned</div>
          </div>
          <div>
            <div className="l-stat-val serif">{stats.forged}</div>
            <div className="l-stat-lbl">goals forged</div>
          </div>
        </div>
      </div>
      <div className="l-hero-visual hidden md:flex">
        <div className="forge-orb">
          <div className="forge-orb-inner">
            <Award className="forge-orb-icon" />
          </div>
        </div>
        <div className="float-tag ft1">
          <GitCommit style={{ width: 12, height: 12, marginRight: 4, display: 'inline-block' }} /> GitHub verified
        </div>
        <div className="float-tag ft2">
          <span style={{ color: 'var(--green)', marginRight: 4 }}>●</span> Passive tracking
        </div>
        <div className="float-tag ft3">
          <Shield style={{ width: 12, height: 12, marginRight: 4, color: 'var(--amber)', display: 'inline-block' }} /> Stake protected
        </div>
      </div>
    </section>
  );
}
