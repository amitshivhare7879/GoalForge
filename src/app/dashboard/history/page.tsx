'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { deriveGoalStatus } from '@/lib/goal-helpers';

export default function HistoryPage() {
  const supabase = createClient();
  const router = useRouter();
  const [forges, setForges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Fetch ALL forges — filter client-side with deriveGoalStatus
      // so we never miss goals due to inconsistent DB status strings.
      const { data: forgesData } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (forgesData) {
        // Keep only terminal goals (Completed or Failed)
        const terminal = forgesData.filter(f => {
          const s = deriveGoalStatus(f);
          return s === 'Completed' || s === 'Failed';
        });
        setForges(terminal);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>
      Loading history...
    </div>
  );

  const quenchedCount = forges.filter(f => deriveGoalStatus(f) === 'Completed').length;

  return (
    <div className="view active" id="view-history">
      <div className="view-header">
        <div className="view-h serif">History</div>
        <div className="view-sub">{quenchedCount} goal{quenchedCount !== 1 ? 's' : ''} quenched. Every one hardened you.</div>
      </div>
      <div className="card">
        {forges.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text3)', textAlign: 'center', padding: '40px' }}>
            No completed goals in your history yet.
          </p>
        ) : (
          <div className="goal-list">
            {forges.map(forge => {
              const status = deriveGoalStatus(forge);
              const isForged = status === 'Completed';
              const dateLabel = isForged ? 'Completed' : 'Failed';
              const date = new Date(forge.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const stakeValue = parseFloat(forge.stake?.replace(/[^\d.]/g, '') || '0');
              const completedCount = forge.completed_days?.length || 0;
              // Only show yield for genuinely completed goals
              const yieldMock = isForged ? Math.round(stakeValue * 0.005) : 0;

              return (
                <div key={forge.id} className="goal-card" style={{ cursor: 'default', borderLeft: `3px solid ${isForged ? 'var(--green)' : 'var(--red)'}` }}>
                  <div className="goal-card-header">
                    <div>
                      <div className="goal-card-title">{forge.title}</div>
                      <div className="goal-card-meta">{forge.category} · {dateLabel} {date} · {forge.duration_days} days</div>
                    </div>
                    <span className={`badge ${isForged ? 'badge-green' : 'badge-red'}`}>
                      {isForged ? 'Quenched' : 'Broken'}
                    </span>
                  </div>
                  <div className="prog-track">
                    <div
                      className="prog-fill"
                      style={{
                        width: isForged ? '100%' : `${Math.round((completedCount / forge.duration_days) * 100)}%`,
                        background: isForged ? 'var(--green)' : 'var(--red)'
                      }}
                    />
                  </div>
                  <div className="goal-card-footer">
                    <span className="goal-prog-label">
                      {isForged
                        ? `100% complete · ₹${stakeValue.toLocaleString()} returned${yieldMock > 0 ? ` + ₹${yieldMock} yield` : ''}`
                        : `${completedCount}/${forge.duration_days} days · ₹${stakeValue.toLocaleString()} forfeited`
                      }
                    </span>
                    <span style={{ fontSize: '12px', color: isForged ? 'var(--green)' : 'var(--red)' }}>
                      {isForged ? `+${forge.duration_days * 5} pts` : `-${Math.round(forge.duration_days * 2)} pts`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
