'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap, GitCommit } from 'lucide-react';
import { Button } from '@/components/shared/Button';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div id="page-auth" className="active" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="auth-bg"></div>
      <div className="auth-card">
        <div className="auth-logo cursor-pointer" onClick={() => router.push('/')}>
          <div className="logo-mark"><Zap style={{ width: 16, height: 16 }} /></div>
          <span className="logo-text serif" style={{ fontSize: 18 }}>GoalForge</span>
        </div>
        
        <div className="auth-tabs">
          <div className="auth-tab" onClick={() => router.push('/login')}>Sign in</div>
          <div className="auth-tab active">Sign up</div>
        </div>

        <div>
          <h2 className="auth-h serif">Create account</h2>
          <p className="auth-sub">Start forging your goals today.</p>

          <div className="form-group">
            <label className="label">Full Name</label>
            <input type="text" className="input" placeholder="Aman Verma" />
          </div>

          <div className="form-group">
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="you@example.com" />
          </div>
          
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>

          <Button variant="amber" fullWidth onClick={() => router.push('/dashboard')}>
            Create Account
          </Button>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <div className="auth-divider-text">OR CONTINUE WITH</div>
            <div className="auth-divider-line"></div>
          </div>

          <button className="oauth-btn" onClick={() => router.push('/dashboard')}>
            <GitCommit className="oauth-icon" />
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
