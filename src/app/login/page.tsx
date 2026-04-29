'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, GitCommit, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="page-auth" className="active" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="auth-bg"></div>
      <div className="auth-card">
        <div className="auth-logo cursor-pointer" onClick={() => router.push('/')}>
          <div className="logo-mark"><Zap style={{ width: 16, height: 16 }} /></div>
          <span className="logo-text serif" style={{ fontSize: 18 }}>GoalForge</span>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setErrorMsg(''); }}>Sign in</div>
          <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setErrorMsg(''); }}>Sign up</div>
        </div>

        <form onSubmit={handleAuth}>
          <h2 className="auth-h serif">{tab === 'signin' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-sub">{tab === 'signin' ? 'Enter your details to continue forging.' : 'Start forging your goals today.'}</p>

          {errorMsg && (
            <div style={{ background: 'var(--redDim)', border: '1px solid rgba(224,92,92,.2)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>
              {errorMsg}
            </div>
          )}

          {tab === 'signup' && (
            <div className="form-group">
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" className="btn btn-amber btn-full" disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" style={{ marginRight: 8 }} /> Processing...</> : tab === 'signin' ? 'Sign in to Dashboard' : 'Create Account'}
          </button>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <div className="auth-divider-text">OR CONTINUE WITH</div>
            <div className="auth-divider-line"></div>
          </div>

          <button type="button" className="oauth-btn" onClick={async () => {
            await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/dashboard` } });
          }}>
            <GitCommit className="oauth-icon" />
            GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
