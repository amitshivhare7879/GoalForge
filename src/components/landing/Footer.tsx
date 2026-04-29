'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';

export function Footer() {
  const router = useRouter();

  return (
    <>
      <div className="l-cta" style={{ position: 'relative', zIndex: 5 }}>
        <div>
          <h2 className="l-cta-h serif">Ready to forge<br /><em style={{ color: 'var(--amber)' }}>something real?</em></h2>
          <p className="l-cta-p">Your first goal is free. No card required. The AI Pathfinder will validate your timeline and build your plan in under 2 minutes.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
          <Button variant="amber" size="lg" onClick={() => router.push('/signup')} leftIcon={<Zap style={{ width: 18, height: 18 }} />}>
            Start for free
          </Button>
          <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No credit card · Cancel anytime</p>
        </div>
      </div>

      <footer className="l-footer">
        <div className="logo">
          <div className="logo-mark"><Zap style={{ width: 14, height: 14 }} /></div>
          <span className="logo-text" style={{ fontSize: 15 }}>GoalForge</span>
        </div>
        <p className="l-footer-p">© 2026 GoalForge. Built for the serious.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>Privacy</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>Terms</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>Contact</span>
        </div>
      </footer>
    </>
  );
}
