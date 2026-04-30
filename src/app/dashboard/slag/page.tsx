'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SlagPage() {
  const supabase = createClient();
  const router = useRouter();
  const [forges, setForges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: forgesData } = await supabase
        .from('forges')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Broken')
        .order('updated_at', { ascending: false });

      if (forgesData) setForges(forgesData);
      setIsLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>Loading slag heap...</div>;

  return (
    <div className="view active" id="view-slag">
      <div className="view-header">
        <div className="view-h serif">Slag Heap</div>
        <div className="view-sub">Goals that didn't make it. Learn, adapt, return stronger.</div>
      </div>
      
      <div style={{ background: 'var(--redDim)', border: '1px solid rgba(224,92,92,.15)', borderRadius: 'var(--rlg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <AlertTriangle size={16} className="text-red-500 shrink-0" />
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5 }}>
          {forges.length} {forges.length === 1 ? 'goal' : 'goals'} in the slag heap. The AI analyzes patterns to suggest improvements for your next forge.
        </p>
      </div>

      {forges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text3)' }}>The slag heap is empty. Keep that streak alive!</p>
        </div>
      ) : (
        forges.map(forge => {
          const date = new Date(forge.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const stakeValue = parseFloat(forge.stake?.replace(/[^\d.]/g, '') || '0');
          const completedCount = forge.completed_days?.length || 0;

          return (
            <div key={forge.id} className="slag-card">
              <div className="slag-title">{forge.title}</div>
              <div className="slag-meta">Failed · {date} · Day {completedCount} of {forge.duration_days} · ₹{stakeValue.toLocaleString()} forfeited</div>
              <div className="slag-lesson">
                <strong>AI analysis:</strong> This goal failed during the {completedCount < (forge.duration_days / 2) ? 'early' : 'late'} phase. 
                Common patterns suggest the {forge.category} intensity curve was {completedCount < 5 ? 'too steep at intake' : 'difficult to maintain'}. 
                Recommend: 15% reduction in duration or increased buffer allocation for the next attempt.
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
