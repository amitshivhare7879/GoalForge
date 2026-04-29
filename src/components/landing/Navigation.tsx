'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const router = useRouter();

  const scrollTo = (y: number) => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <nav className="l-nav">
      <div className="logo cursor-pointer" onClick={() => router.push('/')}>
        <div className="logo-mark"><Zap style={{ width: 16, height: 16 }} /></div>
        <span className="logo-text">GoalForge</span>
      </div>
      <div className="l-nav-links">
        <span className="l-nav-link" onClick={() => scrollTo(600)}>How it works</span>
        <span className="l-nav-link" onClick={() => scrollTo(1200)}>Features</span>
        <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Sign in</Button>
        <Button variant="amber" size="sm" onClick={() => router.push('/signup')}>Start forging</Button>
      </div>
    </nav>
  );
}
