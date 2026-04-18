'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Shield, TrendingUp, Hammer, ChevronRight, ArrowUpRight } from 'lucide-react';
import { ThreeDCard } from '@/components/ThreeDCard';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-[#f5f5f7] font-sans selection:bg-forge-amber/50">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-forge-amber/10 blur-[160px] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      {/* Minimalist Header */}
      <header className="relative z-50 flex items-center justify-between px-8 py-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-forge-amber flex items-center justify-center" suppressHydrationWarning>
            <Flame size={18} className="text-black" fill="currentColor" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">GoalForge</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-forge-muted tracking-wide">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#protocol" className="hover:text-white transition-colors">Protocol</Link>
          <Link href="#reputation" className="hover:text-white transition-colors">Reputation</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[13px] font-semibold hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-bold hover:bg-[#e5e5e7] transition-all hover:scale-[1.02] active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-40">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-[0.2em] text-forge-amber"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-forge-amber animate-pulse" />
            Beta Protocol Live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-[5.5rem] font-display font-bold tracking-[-0.03em] leading-[1] text-white"
          >
            Irreversible <br />
            Accountability.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl text-lg md:text-xl text-forge-muted font-medium leading-relaxed"
          >
            Passive verification. Financial skin in the game. <br />
            The most effective protocol for high-stakes habits.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-10"
          >
            <Link 
              href="/signup" 
              className="px-10 py-4 rounded-2xl bg-forge-amber text-black text-lg font-bold hover:bg-forge-gold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,140,0,0.2)]"
            >
              Start Forging
            </Link>
            <button className="px-10 py-4 rounded-2xl border border-white/10 bg-white/5 text-lg font-bold backdrop-blur-md hover:bg-white/10 transition-all">
              View Demo
            </button>
          </motion.div>
        </div>

        {/* ─── Hero Visual (3D Perspective Card) ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 relative perspective-1000"
        >
          <div className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            {/* Minimal Dashboard Preview */}
            <div className="absolute inset-0 p-8 flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-forge-muted">Active Protocol</p>
                  <p className="text-xl font-bold">Deep Work Sprint</p>
                </div>
                <div className="flex gap-4">
                   <div className="px-3 py-1 rounded-full bg-forge-green/10 border border-forge-green/20 text-[10px] font-bold text-forge-green tracking-widest uppercase">Verified</div>
                   <div className="px-3 py-1 rounded-full bg-forge-amber/10 border border-forge-amber/20 text-[10px] font-bold text-forge-amber tracking-widest uppercase">$400 Stake</div>
                </div>
              </div>

              <div className="flex-1 flex gap-8">
                <div className="flex-1 bg-white/5 rounded-3xl border border-white/5 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-forge-amber/10 blur-3xl rounded-full" />
                  <p className="text-sm font-bold opacity-40">Progress Flow</p>
                  <div className="mt-8 h-32 w-full flex items-end gap-2">
                    {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-forge-amber to-forge-gold rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="w-64 space-y-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-sm font-bold opacity-40">Forge Score</p>
                    <p className="text-4xl font-black mt-2">842</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-sm font-bold opacity-40">Buffer Days</p>
                    <p className="text-4xl font-black mt-2">02</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Abstract 3D Orbs (Minimal) */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-forge-amber/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-forge-amber/5 blur-[100px] rounded-full" />
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Shield size={24} />, 
              title: "Passive Verification", 
              desc: "Seamlessly connects to GitHub, Health, and Calendar. If you didn't do it, the Forge knows." 
            },
            { 
              icon: <TrendingUp size={24} />, 
              title: "Yield Protocol", 
              desc: "Stake capital on your habits. Earn yield on your discipline, or watch it burn if you break." 
            },
            { 
              icon: <Hammer size={24} />, 
              title: "The Quench", 
              desc: "Extreme visual feedback for extreme effort. Watch your progress transform into Reputation." 
            }
          ].map((f, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
              <div className="mb-8 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-forge-amber group-hover:scale-110 transition-transform duration-500" suppressHydrationWarning>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-forge-muted font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 opacity-40">
          <Flame size={16} />
          <span className="text-xs font-bold tracking-widest uppercase">GoalForge Protocol v1.0</span>
        </div>
        <div className="flex gap-10 text-xs font-bold uppercase tracking-widest text-forge-muted">
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
