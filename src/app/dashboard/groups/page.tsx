'use client';

import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [pacts, setPacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Note: Group pacts are not yet in the schema, but we check for any goals categorized as 'Group'
      const { data: groupGoals } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'Group');

      if (groupGoals) setPacts(groupGoals);
      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>Loading group pacts...</div>;

  return (
    <div className="view active" id="view-groups">
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">Group Goals</div>
          <div className="view-sub">Shared accountability. Collective stakes.</div>
        </div>
        <button className="btn btn-amber"><Plus size={16} /> Create pact</button>
      </div>

      {pacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--surf2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text3)' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No active pacts</h3>
          <p style={{ fontSize: '14px', color: 'var(--text2)', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Forge pacts allow you to commit to goals with friends. Shared stakes means shared success — if anyone fails, the collective buffer is drained.
          </p>
          <button className="btn btn-surface">Browse public pacts</button>
        </div>
      ) : (
        <div className="goal-list">
          {pacts.map(pact => (
            <div key={pact.id} className="pact-card">
              <div className="pact-header">
                <div>
                  <div className="pact-title">{pact.title}</div>
                  <div className="pact-members">1 member (Personal Pact) · {pact.duration_days} days</div>
                </div>
                <span className="badge badge-amber">{pact.status}</span>
              </div>
              <div className="member-avatars">
                <div className="member-av" style={{ background: 'linear-gradient(135deg,#f5a623,#fbbf4a)' }}>U</div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div className="flex-between" style={{ marginBottom: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text2)' }}>Team progress</span>
                  <span style={{ fontWeight: 600, color: 'var(--amber)' }}>{Math.round((pact.completed_days?.length || 0 / pact.duration_days) * 100)}%</span>
                </div>
                <div className="prog-track" style={{ height: '6px' }}>
                  <div className="prog-fill prog-amber" style={{ width: `${(pact.completed_days?.length || 0 / pact.duration_days) * 100}%` }}></div>
                </div>
              </div>
              <div className="pact-warning">
                <AlertTriangle size={14} className="shrink-0" />
                Individual accountability mode active for this group goal.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REFERENCE FOR DESIGN */}
      <div style={{ marginTop: '40px', opacity: 0.4 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '20px' }}>Design Reference (Locked)</div>
        <div className="pact-card" style={{ filter: 'grayscale(1)' }}>
          <div className="pact-header">
            <div>
              <div className="pact-title">Example: Morning Warriors — 5AM Club</div>
              <div className="pact-members">8 members · 30 days</div>
            </div>
            <span className="badge badge-ghost">Locked</span>
          </div>
          <div className="member-avatars">
            <div className="member-av">A</div><div className="member-av">B</div><div className="member-av">C</div><div className="member-av">D</div>
            <div className="member-av" style={{ background: 'var(--surf2)', color: 'var(--text2)' }}>+4</div>
          </div>
        </div>
      </div>
    </div>
  );
}
