'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { VerificationCard } from '@/components/dashboard/VerificationCard';
import { StatsHeader } from '@/components/dashboard/StatsHeader';
import { Goal, UserStats, Verification } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from /api/dashboard/stats and /api/goals
    // Mocking for the prototype conversion
    const fetchData = async () => {
      try {
        // Mock data
        setStats({
          activeGoals: 3,
          forgeScore: 847,
          weekProgress: 88,
        });
        
        setGoals([
          {
            id: '1',
            title: 'Ship GoalForge MVP',
            description: 'Complete the Next.js migration and Supabase integration.',
            category: 'Build',
            progress: 65,
            status: 'active',
            days: 30,
            stake: '₹5,000',
            curve: []
          },
          {
            id: '2',
            title: 'Deep Work Sprint',
            description: '3 hours of deep work daily, verified by wakatime.',
            category: 'Habit',
            progress: 80,
            status: 'active',
            days: 14,
            stake: '₹1,000',
            curve: []
          }
        ]);

        setVerifications([
          { id: 'v1', goalId: '1', service: 'github', status: 'connected', lastSync: '10 mins ago' },
          { id: 'v2', goalId: '2', service: 'calendar', status: 'connected', lastSync: '1 hr ago' },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div id="page-dash" className="page active">
      {/* SIDEBAR */}
      <aside className="sidebar fixed h-screen hidden md:flex flex-col">
        <div className="sb-logo">
          <div className="logo cursor-pointer" onClick={() => router.push('/')}>
            <div className="logo-mark"><Zap style={{ width: 14, height: 14 }} /></div>
            <span className="logo-text serif" style={{ fontSize: 16 }}>GoalForge</span>
          </div>
        </div>

        <div className="sb-section mt-4">
          <div className="sb-section-lbl">Menu</div>
          <div className="nav-item active">
            <Zap className="nav-icon" /> Dashboard
          </div>
          <div className="nav-item" onClick={() => router.push('/pathfinder')}>
            <Plus className="nav-icon" /> New Goal
          </div>
        </div>

        <div className="sb-bottom mt-auto mb-4">
          <div className="sb-user" onClick={() => router.push('/settings')}>
            <div className="sb-avatar">AV</div>
            <div>
              <div className="sb-user-name">Aman Verma</div>
              <div className="sb-user-role">Settings</div>
            </div>
          </div>
          <div className="sb-user mt-2 text-red-400" onClick={() => router.push('/login')}>
            <LogOut size={16} className="mr-2" /> Sign out
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content md:ml-[260px]">
        <div className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Dashboard</h1>
          </div>
          <div className="topbar-right">
            <Button variant="amber" size="sm" onClick={() => router.push('/pathfinder')}>
              + New Forge
            </Button>
          </div>
        </div>

        <div className="page-body">
          <div className="view-header">
            <h2 className="view-h">Overview</h2>
            <p className="view-sub">Your current discipline metrics and active commitments.</p>
          </div>

          {stats && <StatsHeader stats={stats} />}

          <div className="dash-grid">
            {/* GOALS COLUMN */}
            <div>
              <div className="mb-4 font-semibold">Active Forges</div>
              <div className="goal-list">
                {goals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
                {goals.length === 0 && (
                  <div className="text-center p-8 text-text3 border border-border2 rounded-xl">
                    No active goals. Start forging!
                  </div>
                )}
              </div>
            </div>

            {/* VERIFICATIONS COLUMN */}
            <div>
              <div className="mb-4 font-semibold">Verification Gateways</div>
              <div className="verif-grid">
                {verifications.map(verif => (
                  <VerificationCard key={verif.id} verification={verif} />
                ))}
              </div>
              <div className="mt-8 p-6 rounded-xl border border-border2 bg-surf2">
                <h3 className="text-sm font-semibold mb-2">Need a new integration?</h3>
                <p className="text-xs text-text2 mb-4">Connect GitHub, Health, or Calendar in your settings to unlock passive verification.</p>
                <Button variant="surface" size="sm" fullWidth onClick={() => router.push('/settings')}>
                  Manage Integrations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
