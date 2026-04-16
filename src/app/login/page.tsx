'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Flame, ChevronLeft } from 'lucide-react';
import { ForgeInput } from '@/components/ForgeInput';
import { ForgeButton } from '@/components/ForgeButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setMessage(msg);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#030303] px-6">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-forge-amber/5 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="mb-8 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <Flame className="text-forge-amber" size={24} fill="currentColor" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Protocol Login</h1>
          <p className="mt-2 text-sm text-forge-muted font-medium">Continue your forging journey</p>
        </div>

        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <ForgeInput 
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <ForgeInput 
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-xs font-bold text-[#ff4d4d] text-center">{error}</p>
            )}

            {message && (
              <p className="text-xs font-bold text-forge-amber text-center">{message}</p>
            )}

            <ForgeButton type="submit" className="w-full" isLoading={isLoading}>
              Log In
            </ForgeButton>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-forge-muted">
            <span>New to protocol?</span>
            <Link href="/signup" className="text-forge-amber hover:text-white transition-colors">
              Create Account
            </Link>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-4">
          <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-all">
            Forgot Password?
          </button>
          <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-all">
             <ChevronLeft size={12} />
             Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
