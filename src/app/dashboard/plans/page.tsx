'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PlansPage() {
  const router = useRouter();
  const supabase = createClient();
  const [forges, setForges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('forges').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setForges(data);
      setIsLoading(false);
    };
    fetchPlans();
  }, [supabase]);

  const activePlans = forges.filter(f => f.status === 'Active');
  const completedPlans = forges.filter(f => f.status === 'Forged');
  
  const getProgress = (forge: any) => {
    const total = forge.duration_days;
    const daysActive = Math.ceil(Math.abs(new Date().getTime() - new Date(forge.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    return Math.round((Math.min(daysActive, total) / total) * 100) || 2;
  };
  
  const getDay = (forge: any) => {
    return Math.ceil(Math.abs(new Date().getTime() - new Date(forge.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1;
  };

  if (isLoading) return <div className="p-10 text-center">Loading plans...</div>;

  return (
    <div className="view active" id="view-plans">
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">My Plans</div>
          <div className="view-sub">{activePlans.length} active · {completedPlans.length} completed</div>
        </div>
        <button className="btn btn-amber" onClick={() => router.push('/dashboard/pathfinder')}>
          <Plus size={16} /> New plan
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button className="btn btn-amber btn-sm">All</button>
        <button className="btn btn-ghost btn-sm">Active</button>
        <button className="btn btn-ghost btn-sm">Completed</button>
        <button className="btn btn-ghost btn-sm">Failed</button>
      </div>

      {forges.length === 0 ? (
        <div className="p-10 text-center rounded-lg border border-dashed border-border" style={{ color: 'var(--text3)' }}>
          No plans forged yet.
        </div>
      ) : (
        forges.map(forge => {
          const day = getDay(forge);
          const progress = getProgress(forge);
          return (
            <div key={forge.id} className="plan-card" style={{ marginBottom: 16 }}>
              <div className="plan-card-top">
                <div>
                  <div className="plan-card-title">{forge.title}</div>
                  <div className="plan-card-category">{forge.category} · Started {new Date(forge.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="plan-stake">{forge.stake || '₹500'}</div>
                  <div className="plan-stake-lbl">staked</div>
                </div>
              </div>
              <div className="plan-timeline">
                 <div className="tl-bar done"></div><div className="tl-bar today"></div><div className="tl-bar"></div>
              </div>
              <div className="prog-track"><div className="prog-fill prog-amber" style={{ width: `${progress}%` }}></div></div>
              <div className="plan-footer">
                <span className="plan-days-left"><strong>{Math.max(0, forge.duration_days - day)} days</strong> remaining · Day {day} of {forge.duration_days}</span>
                <span className={`badge ${forge.status === 'Active' ? 'badge-amber' : 'badge-green'}`}>{forge.status}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
