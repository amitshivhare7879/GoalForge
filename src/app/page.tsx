'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, Award, GitCommit, Shield, Brain, 
  ShieldCheck, TrendingUp, Coins, CalendarCheck, Users 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const navigate = (path: string) => {
    if (path === 'auth') router.push('/login');
    if (path === 'dash') router.push('/dashboard');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="page-landing" className="page active min-h-screen">
      <div className="l-grid"></div>
      <div className="l-glow l-glow-a"></div>
      <div className="l-glow l-glow-b"></div>

      <nav className="l-nav flex-between px-10 py-6 sticky top-0 z-50 backdrop-blur-md border-b justify-between" style={{ borderBottomColor: 'var(--border)' }}>
        <div className="logo flex items-center gap-2">
          <div className="logo-mark flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-black">
            <Zap size={16} />
          </div>
          <span className="logo-text font-serif text-xl font-bold">GoalForge</span>
        </div>
        <div className="l-nav-links flex items-center gap-6">
          <span className="l-nav-link text-sm text-text2 cursor-pointer hover:text-text transition-colors" onClick={() => scrollTo('how-it-works')}>How it works</span>
          <span className="l-nav-link text-sm text-text2 cursor-pointer hover:text-text transition-colors" onClick={() => scrollTo('features')}>Features</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('auth')}>Sign in</button>
          <button className="btn btn-amber btn-sm" onClick={() => navigate('auth')}>Start forging</button>
        </div>
      </nav>

      <section className="l-hero max-w-7xl mx-auto">
        <div className="pr-4">
          <div className="l-hero-eyebrow">
            <div className="l-eyebrow-line"></div>
            <span className="l-eyebrow-text">AI-powered accountability</span>
          </div>
          <h1 className="l-hero-h1 serif">Stop Dreaming.<br/><em className="text-amber-500">Start Forging.</em></h1>
          <p className="l-hero-sub">GoalForge turns vague intentions into verifiable commitments — with AI personalization, passive API verification, and real financial skin in the game.</p>
          <div className="l-hero-cta">
            <button className="btn btn-amber btn-lg" onClick={() => navigate('auth')}>
              <Zap size={18} /> Forge my first goal
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('dash')}>See dashboard</button>
          </div>
          <div className="l-hero-stats">
            <div>
              <div className="l-stat-val serif">94%</div>
              <div className="l-stat-lbl">completion rate vs 20% industry avg</div>
            </div>
            <div>
              <div className="l-stat-val serif">₹2.1Cr</div>
              <div className="l-stat-lbl">stakes locked and returned</div>
            </div>
            <div>
              <div className="l-stat-val serif">12K+</div>
              <div className="l-stat-lbl">goals forged</div>
            </div>
          </div>
        </div>
        <div className="l-hero-visual relative">
          <div className="forge-orb mx-auto mt-10">
            <div className="forge-orb-inner">
              <Award className="forge-orb-icon" />
            </div>
          </div>
          <div className="float-tag ft1 flex items-center gap-1.5 border-border">
            <GitCommit size={12} /> GitHub verified
          </div>
          <div className="float-tag ft2 border-border">
            <span className="text-green-500 mr-1">●</span> Passive tracking
          </div>
          <div className="float-tag ft3 flex items-center gap-1.5 border-border">
            <Shield size={12} className="text-amber-500" /> Stake protected
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="l-how max-w-7xl mx-auto">
        <div className="l-section-label">The process</div>
        <h2 className="l-section-h2 serif">The Path of the Forge</h2>
        <div className="how-steps grid grid-cols-1 md:grid-cols-4 gap-8 relative mt-12">
          <div className="how-step">
            <div className="how-num serif">1</div>
            <div className="how-step-h">AI Pathfinder</div>
            <p className="how-step-p">Describe your goal. The AI validates your timeline, classifies it, and builds a realistic difficulty curve.</p>
          </div>
          <div className="how-step">
            <div className="how-num serif shadow-lg shadow-amber-500/10" style={{ background: 'var(--amberDim)', borderColor: 'rgba(245,166,35,.3)'}}>2</div>
            <div className="how-step-h">Commit your stake</div>
            <p className="how-step-p">Lock a meaningful amount. Not punitive — it's returned on success with yield earned during the lock period.</p>
          </div>
          <div className="how-step">
            <div className="how-num serif">3</div>
            <div className="how-step-h">Passive verification</div>
            <p className="how-step-p">GitHub, Google Calendar, GPS, and Health APIs automatically confirm progress — no manual check-ins.</p>
          </div>
          <div className="how-step">
            <div className="how-num serif shadow-lg shadow-green-500/10" style={{ background: 'var(--greenDim)', borderColor: 'rgba(77,179,126,.3)'}}>4</div>
            <div className="how-step-h">The Quench</div>
            <p className="how-step-p">Goal achieved. Stake returned. Forge Score updated. A cinematic moment for every hard-won completion.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="l-features max-w-7xl mx-auto">
        <div className="l-section-label">What makes GoalForge different</div>
        <h2 className="l-section-h2 serif">Built for people who are<br/>serious about this time</h2>
        <div className="grid3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="feat-card">
            <div className="feat-icon feat-icon-amber"><Brain size={20} className="text-amber-500" /></div>
            <div className="feat-h">Goal intelligence, not templates</div>
            <p className="feat-p">The AI understands that a fitness goal and a coding goal need completely different intensity curves, timelines, and milestones.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-steel"><ShieldCheck size={20} className="text-blue-400" /></div>
            <div className="feat-h">Passive verification</div>
            <p className="feat-p">Connected to GitHub, Google Calendar, GPS geofencing, and Health APIs. Your progress is confirmed automatically — not self-reported.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-green"><TrendingUp size={20} className="text-green-500" /></div>
            <div className="feat-h">Forge Score — public reputation</div>
            <p className="feat-p">A discipline rating that compounds over time. Not hidden badges — a real, public signal of how serious you are about what you commit to.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-amber"><Coins size={20} className="text-amber-500" /></div>
            <div className="feat-h">Yield-protocol staking</div>
            <p className="feat-p">Your locked stake earns yield while you work. Succeed and get back more than you put in. Fail and it funds accountability, not charity.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-steel"><CalendarCheck size={20} className="text-blue-400" /></div>
            <div className="feat-h">Buffer days built-in</div>
            <p className="feat-p">Life happens. Each goal comes with buffer days — use one and the lock period extends, maintaining both flexibility and accountability.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-green"><Users size={20} className="text-green-500" /></div>
            <div className="feat-h">Group forge pacts</div>
            <p className="feat-p">Commit with a team. Shared stakes, shared accountability. If the group succeeds, everyone wins. Peer pressure, productively applied.</p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="l-cta max-w-7xl mx-auto my-16">
        <div>
          <h2 className="l-cta-h serif">Ready to forge<br/><em className="text-amber-500">something real?</em></h2>
          <p className="l-cta-p">Your first goal is free. No card required. The AI Pathfinder will validate your timeline and build your plan in under 2 minutes.</p>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <button className="btn btn-amber btn-lg" onClick={() => navigate('auth')}>
            <Zap size={18} /> Start for free
          </button>
          <p className="text-xs text-text3 text-center">No credit card · Cancel anytime</p>
        </div>
      </div>

      <footer className="l-footer max-w-7xl mx-auto border-t border-border mt-10">
        <div className="logo flex items-center gap-2">
          <div className="logo-mark"><Zap size={14} /></div>
          <span className="logo-text text-sm font-semibold">GoalForge</span>
        </div>
        <p className="l-footer-p">© 2026 GoalForge. Built for the serious.</p>
        <div className="flex gap-5">
          <span className="text-xs text-text3 cursor-pointer hover:text-text">Privacy</span>
          <span className="text-xs text-text3 cursor-pointer hover:text-text">Terms</span>
          <span className="text-xs text-text3 cursor-pointer hover:text-text">Contact</span>
        </div>
      </footer>
    </div>
  );
}
