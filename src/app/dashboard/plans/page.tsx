'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { deriveGoalStatus, getCurrentDay, getGoalProgress } from '@/lib/goal-helpers';

type FilterType = 'All' | 'Active' | 'Completed' | 'Failed';


export default function PlansPage() {
  const router = useRouter();
  const supabase = createClient();
  const [forges, setForges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('All');

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setForges(data);
      setIsLoading(false);
    };
    fetchPlans();
  }, [supabase]);

  // Annotate each forge with derived status
  const annotated = forges.map(f => ({ ...f, _status: deriveGoalStatus(f) }));

  const activePlans    = annotated.filter(f => f._status === 'Active');
  const completedPlans = annotated.filter(f => f._status === 'Completed');
  const failedPlans    = annotated.filter(f => f._status === 'Failed');

  const filtered =
    filter === 'All'       ? annotated
    : filter === 'Active'  ? activePlans
    : filter === 'Completed' ? completedPlans
    : failedPlans;

  const badgeClass = (status: string) => {
    if (status === 'Completed') return 'badge-green';
    if (status === 'Failed')    return 'badge-red';
    return 'badge-amber';
  };

  const barClass = (status: string, i: number, completedBars: number) => {
    if (status === 'Failed') return 'tl-bar' + (i < completedBars ? ' done' : '');
    if (status === 'Completed') return 'tl-bar done';
    if (i < completedBars) return 'tl-bar done';
    if (i === completedBars) return 'tl-bar today';
    return 'tl-bar';
  };

  if (isLoading) return <div className="p-10 text-center">Loading plans...</div>;

  const FILTERS: FilterType[] = ['All', 'Active', 'Completed', 'Failed'];

  return (
    <div className="view active" id="view-plans">
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">My Plans</div>
          <div className="view-sub">
            {activePlans.length} active · {completedPlans.length} completed · {failedPlans.length} failed
          </div>
        </div>
        <button className="btn btn-amber" onClick={() => router.push('/dashboard/pathfinder')}>
          <Plus size={16} /> New plan
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-amber' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f !== 'All' && (
              <span style={{
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 99,
                padding: '1px 7px',
              }}>
                {f === 'Active' ? activePlans.length
                  : f === 'Completed' ? completedPlans.length
                  : failedPlans.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Plan List ── */}
      <div className="plan-list">
        {filtered.length === 0 ? (
          <div
            className="p-10 text-center rounded-lg border border-dashed"
            style={{ color: 'var(--text3)', borderColor: 'var(--border)', padding: '60px 20px' }}
          >
            No {filter === 'All' ? '' : filter.toLowerCase() + ' '}plans found.
          </div>
        ) : (
          filtered.map(forge => {
            const status     = forge._status;
            const day        = getCurrentDay(forge);
            const progress   = getGoalProgress(forge, status);
            const totalBars  = 8;
            const completedBars = Math.floor((progress / 100) * totalBars);
            const daysLeft   = Math.max(0, forge.duration_days - day);
            const isFailed   = status === 'Failed';

            return (
              <div
                key={forge.id}
                className="plan-card card-hover"
                style={{
                  marginBottom: 16,
                  borderColor: isFailed ? 'rgba(224,92,92,0.3)' : undefined,
                }}
                onClick={() => router.push(`/dashboard/goals/${forge.id}`)}
              >
                <div className="plan-card-top">
                  <div>
                    <div className="plan-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {forge.title}
                      {isFailed && (
                        <span style={{ fontSize: 11, color: 'var(--red)', background: 'var(--redDim)', borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
                          FAILED
                        </span>
                      )}
                    </div>
                    <div className="plan-card-category">
                      {forge.category} · Started {new Date(forge.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="plan-stake">₹{String(forge.stake || '500').replace(/^₹/, '')}</div>
                    <div className="plan-stake-lbl">staked</div>
                  </div>
                </div>

                {/* Timeline bars */}
                <div className="plan-timeline">
                  {Array.from({ length: totalBars }).map((_, i) => (
                    <div
                      key={i}
                      className={barClass(status, i, completedBars)}
                      style={isFailed ? { background: 'var(--redDim)', border: '1px solid rgba(224,92,92,0.25)' } : undefined}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="prog-track">
                  <div
                    className={`prog-fill ${isFailed ? '' : 'prog-amber'}`}
                    style={{
                      width: `${progress}%`,
                      background: isFailed
                        ? 'linear-gradient(90deg, var(--red), #f07070)'
                        : status === 'Completed'
                        ? 'linear-gradient(90deg, var(--green), #6ed49e)'
                        : undefined,
                    }}
                  />
                </div>

                {/* Footer */}
                <div className="plan-footer">
                  <span className="plan-days-left">
                    {isFailed ? (
                      <span style={{ color: 'var(--red)' }}>
                        Plan expired — completed <strong>{day}</strong> of <strong>{forge.duration_days}</strong> days
                      </span>
                    ) : status === 'Completed' ? (
                      <span style={{ color: 'var(--green)' }}>
                        Completed all <strong>{forge.duration_days}</strong> days 🎉
                      </span>
                    ) : (
                      <>
                        <strong>{daysLeft} days</strong> remaining · Day {day} of {forge.duration_days}
                      </>
                    )}
                  </span>
                  <span className={`badge ${badgeClass(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
