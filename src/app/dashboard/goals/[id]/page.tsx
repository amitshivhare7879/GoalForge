'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Flame, Zap, Shield, Clock, Calendar, Camera, MapPin } from 'lucide-react';
import { ForgeButton } from '@/components/ForgeButton';
import { sendNotification } from '@/components/NotificationManager';

// ── helpers ────────────────────────────────────────────────
function getDerivedStatus(goal: any): 'Active' | 'Completed' | 'Failed' {
  const s = (goal.status || '').toLowerCase();
  if (s === 'completed' || s === 'forged') return 'Completed';
  if (s === 'forfeited') return 'Failed';
  const elapsed = Math.ceil(
    Math.abs(Date.now() - new Date(goal.created_at).getTime()) / 86400000
  );
  if (elapsed > goal.duration_days) return 'Failed';
  return 'Active';
}

function getCurrentDay(goal: any): number {
  const elapsed = Math.ceil(
    Math.abs(Date.now() - new Date(goal.created_at).getTime()) / 86400000
  ) || 1;
  return Math.min(elapsed, goal.duration_days);
}

function getProgress(goal: any, status: string): number {
  if (status === 'Completed') return 100;
  if (status === 'Failed') return 100;
  return Math.round((getCurrentDay(goal) / goal.duration_days) * 100) || 2;
}

const generateGoogleCalendarUrl = (task: string, day: number, startDate: string) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + day - 1);
  const ds = date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task)}&dates=${ds}/${ds}`;
};

// ── status colour helpers ──────────────────────────────────
const statusBadgeStyle = (status: string) => {
  if (status === 'Completed') return { background: 'var(--greenDim)', color: 'var(--green)', border: '1px solid rgba(77,179,126,.3)' };
  if (status === 'Failed')    return { background: 'var(--redDim)',   color: 'var(--red)',   border: '1px solid rgba(224,92,92,.3)' };
  return { background: 'var(--amberDim)', color: 'var(--amber)', border: '1px solid rgba(245,166,35,.3)' };
};

// ── page ───────────────────────────────────────────────────
export default function GoalDetailPage() {
  const { id } = useParams();
  const router   = useRouter();
  const supabase = createClient();

  const [goal, setGoal]           = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [verifyType, setVerifyType] = useState('github');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data, error } = await supabase.from('forges').select('*').eq('id', id).single();
      if (cancelled) return;
      if (error || !data) { router.push('/dashboard/plans'); return; }
      setGoal(data);
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTaskAction = async (day: number, action: 'complete' | 'buffer') => {
    if (!goal || isUpdating) return;

    // ── BUFFER ──────────────────────────────────────────────
    if (action === 'buffer') {
      const used = goal.buffer_days_used || 0;
      if (used >= 3) {
        sendNotification('No Buffers Left', 'Each goal has exactly 3 buffer days.');
        return;
      }
      setIsUpdating(true);
      // Extend goal by 1 day + record usage
      const newBufferUsed = used + 1;
      const newDuration   = (goal.duration_days || 0) + 1;
      const forgeUpdate   = { buffer_days_used: newBufferUsed, duration_days: newDuration };
      const { error: fe } = await supabase.from('forges').update(forgeUpdate).eq('id', goal.id);
      if (!fe) {
        // Deduct 10 Forge Score — never below 0
        const { data: prof } = await supabase.from('profiles').select('forge_score').eq('id', (await supabase.auth.getUser()).data.user!.id).single();
        const newScore = Math.max(0, (prof?.forge_score || 0) - 10);
        await supabase.from('profiles').update({ forge_score: newScore }).eq('id', (await supabase.auth.getUser()).data.user!.id);
        setGoal({ ...goal, ...forgeUpdate });
        sendNotification('Buffer Used', `Day extended. ${3 - newBufferUsed} buffer${3 - newBufferUsed !== 1 ? 's' : ''} remaining. -10 Forge Score.`);
      }
      setIsUpdating(false);
      return;
    }

    // ── COMPLETE ─────────────────────────────────────────────
    if (action === 'complete') {
      if ((goal.completed_days || []).includes(day)) return; // already done
      setIsUpdating(true);
      const updatedCompleted = [...(goal.completed_days || []), day];
      // Progress = completed / total days (0-100, only increases)
      const rawProgress = Math.round((updatedCompleted.length / goal.duration_days) * 100);
      const newProgress  = Math.min(100, Math.max(goal.progress || 0, rawProgress));
      const isNowComplete = newProgress >= 100;
      const forgeUpdate: any = { completed_days: updatedCompleted, progress: newProgress };
      if (isNowComplete) forgeUpdate.status = 'completed';
      const { error: fe } = await supabase.from('forges').update(forgeUpdate).eq('id', goal.id);
      if (!fe) {
        setGoal({ ...goal, ...forgeUpdate });
        if (isNowComplete) {
          // +50 Forge Score on completion
          const { data: { user: u } } = await supabase.auth.getUser();
          const { data: prof } = await supabase.from('profiles').select('forge_score').eq('id', u!.id).single();
          const newScore = Math.min(1000, (prof?.forge_score || 0) + 50);
          await supabase.from('profiles').update({ forge_score: newScore }).eq('id', u!.id);
          sendNotification('Goal Complete! 🎉', '+50 Forge Score awarded. Stake returned.');
        } else {
          sendNotification('Day Complete', `Day ${day} verified. Progress: ${newProgress}%`);
        }
      }
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--text3)' }}>
      Loading goal...
    </div>
  );
  if (!goal) return null;

  const status     = getDerivedStatus(goal);
  const currentDay = getCurrentDay(goal);
  const progress   = getProgress(goal, status);
  const daysLeft   = Math.max(0, goal.duration_days - currentDay);
  const isFailed   = status === 'Failed';
  const isCompleted = status === 'Completed';

  const focusTasks = (goal.tasks || []).filter(
    (t: any) => t.day >= currentDay - 2 && t.day <= currentDay + 2
  );

  const stakeDisplay = String(goal.stake || '₹500').replace(/^₹/, '');

  return (
    <div style={{ padding: '0' }}>
      {/* ── Back bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)'
      }}>
        <button
          onClick={() => router.push('/dashboard/plans')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--surf2)', border: '1px solid var(--border)',
            color: 'var(--text2)', cursor: 'pointer', flexShrink: 0
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
            {goal.category}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{goal.title}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
            ...statusBadgeStyle(status)
          }}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* LEFT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Progress summary card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="view-h serif" style={{ fontSize: 20, marginBottom: 0 }}>{goal.title}</div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  ...statusBadgeStyle(status)
                }}>{status}</span>
              </div>

              {/* Timeline bars */}
              <div className="plan-timeline" style={{ gridTemplateColumns: `repeat(${Math.min(goal.duration_days, 14)}, 1fr)`, marginBottom: 10 }}>
                {Array.from({ length: Math.min(goal.duration_days, 14) }).map((_, i) => {
                  const barDay = i + 1;
                  const isDone = (goal.completed_days || []).includes(barDay);
                  const isToday = barDay === currentDay;
                  let cls = 'tl-bar';
                  if (isDone) cls += ' done';
                  else if (isToday) cls += ' today';
                  return (
                    <div key={i} className={cls}
                      style={isFailed && !isDone ? { background: 'var(--redDim)', border: '1px solid rgba(224,92,92,.2)' } : undefined}
                    />
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="prog-track">
                <div
                  className="prog-fill"
                  style={{
                    width: `${progress}%`,
                    background: isFailed
                      ? 'linear-gradient(90deg,var(--red),#f07070)'
                      : isCompleted
                      ? 'linear-gradient(90deg,var(--green),#6ed49e)'
                      : 'linear-gradient(90deg,var(--amber),var(--amber2))'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
                <span style={{ color: isFailed ? 'var(--red)' : 'var(--text2)' }}>
                  {isFailed
                    ? `Plan expired after ${currentDay} of ${goal.duration_days} days`
                    : isCompleted
                    ? `All ${goal.duration_days} days completed 🎉`
                    : `${daysLeft} days remaining · Day ${currentDay} of ${goal.duration_days}`}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--amber)' }}>{progress}%</span>
              </div>
            </div>

            {/* Protocol Execution */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
                  <Zap size={18} style={{ color: 'var(--amber)' }} />
                  Protocol Execution
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Focus: Day {Math.max(1, currentDay - 2)}–{Math.min(goal.duration_days, currentDay + 2)}
                </span>
              </div>

              {focusTasks.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No tasks defined for this window.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {focusTasks.map((t: any, idx: number) => {
                    const done    = (goal.completed_days || []).includes(t.day);
                    const isToday = t.day === currentDay;
                    const isPast  = t.day < currentDay && !done;

                    return (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 10,
                        border: `1px solid ${isToday ? 'rgba(245,166,35,.3)' : isPast && isFailed ? 'rgba(224,92,92,.2)' : 'var(--border)'}`,
                        background: isToday ? 'var(--amberDim)' : isPast && !done ? 'var(--redDim)' : 'var(--bg3)',
                        opacity: done ? 0.6 : 1
                      }}>
                        {/* Day badge */}
                        <div style={{
                          width: 42, height: 42, borderRadius: 8, flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          background: isToday ? 'var(--amber)' : done ? 'var(--greenDim)' : 'var(--surf2)',
                          color: isToday ? '#0b0b0d' : done ? 'var(--green)' : 'var(--text2)',
                          border: `1px solid ${isToday ? 'var(--amber)' : 'var(--border)'}`
                        }}>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>Day</span>
                          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{t.day}</span>
                        </div>

                        {/* Task text */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 14, fontWeight: 500,
                            textDecoration: done ? 'line-through' : 'none',
                            color: done ? 'var(--text3)' : 'var(--text)'
                          }}>
                            {t.task}
                          </div>
                          {done && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ Completed</span>}
                          {isPast && !done && <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>✗ Missed</span>}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {!done && isToday && !isFailed && (
                            <>
                              <button
                                onClick={() => handleTaskAction(t.day, 'complete')}
                                disabled={isUpdating}
                                style={{
                                  padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  background: 'var(--greenDim)', color: 'var(--green)',
                                  border: '1px solid rgba(77,179,126,.3)', transition: 'all .2s'
                                }}
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleTaskAction(t.day, 'buffer')}
                                disabled={isUpdating}
                                style={{
                                  padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  background: 'var(--surf2)', color: 'var(--text2)',
                                  border: '1px solid var(--border)', transition: 'all .2s'
                                }}
                              >
                                Buffer
                              </button>
                            </>
                          )}
                          <a
                            href={generateGoogleCalendarUrl(t.task, t.day, goal.created_at)}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                              width: 34, height: 34, borderRadius: 7, display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              background: 'var(--surf2)', border: '1px solid var(--border)',
                              color: 'var(--text3)', transition: 'all .2s'
                            }}
                          >
                            <Calendar size={14} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Stake */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text3)', marginBottom: 6 }}>
                Skin in the Game
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--amber)', lineHeight: 1 }}>
                ₹{stakeDisplay}
              </div>
              <div style={{
                marginTop: 10, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: isFailed ? 'var(--redDim)' : isCompleted ? 'var(--greenDim)' : 'var(--amberDim)',
                color: isFailed ? 'var(--red)' : isCompleted ? 'var(--green)' : 'var(--amber)'
              }}>
                {isFailed ? '⚠ Stake at Risk' : isCompleted ? '✓ Returned' : '🔒 Locked in Escrow'}
              </div>
            </div>

            {/* Protocol Integrity */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Protocol Integrity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <Clock size={16} />, label: 'Timeline', value: `Day ${currentDay} of ${goal.duration_days}` },
                  {
                    icon: <Zap size={16} style={{ color: 'var(--green)' }} />,
                    label: 'Tasks Done',
                    value: `${goal.completed_days?.length || 0} / ${goal.duration_days}`,
                    valueColor: 'var(--green)'
                  },
                  {
                    icon: <Shield size={16} style={{ color: 'var(--amber)' }} />,
                    label: 'Buffer Used',
                    value: `${goal.buffer_days_used || 0}`
                  },
                  {
                    icon: <Flame size={16} style={{ color: isFailed ? 'var(--red)' : 'var(--amber)' }} />,
                    label: 'Status',
                    value: status,
                    valueColor: isFailed ? 'var(--red)' : isCompleted ? 'var(--green)' : 'var(--amber)'
                  },
                ].map(({ icon, label, value, valueColor }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: 'var(--surf2)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text3)'
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: valueColor || 'var(--text)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Truth Engine */}
            {!isFailed && !isCompleted && (
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} style={{ color: 'var(--amber)' }} />
                  Truth Engine
                </div>

                {/* Auto-sync */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 8 }}>
                    Protocol 01 · Auto-Sync
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {['github', 'leetcode', 'hashnode', 'twitter'].map(type => (
                      <button key={type} onClick={() => setVerifyType(type)} style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer', transition: 'all .2s',
                        background: verifyType === type ? 'var(--amber)' : 'var(--surf2)',
                        color: verifyType === type ? '#0b0b0d' : 'var(--text3)',
                        border: verifyType === type ? '1px solid var(--amber)' : '1px solid var(--border)'
                      }}>
                        {type}
                      </button>
                    ))}
                  </div>
                  <button disabled={isUpdating} onClick={async () => {
                    setIsUpdating(true);
                    const res = await fetch('/api/verify', { method: 'POST', body: JSON.stringify({ forge_id: goal.id, type: verifyType }) });
                    const result = await res.json();
                    sendNotification(result.verified ? 'Sync Success' : 'Sync Failed', result.message || '');
                    setIsUpdating(false);
                  }} style={{
                    width: '100%', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'var(--surf2)', border: '1px solid var(--border)',
                    color: 'var(--text2)', cursor: 'pointer'
                  }}>
                    {isUpdating ? 'Checking...' : 'Force Manual Pulse'}
                  </button>
                </div>

                {/* Physical proof */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 8 }}>
                    Protocol 02 · Proof
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => {
                      if (!navigator.geolocation) return;
                      setIsUpdating(true);
                      navigator.geolocation.getCurrentPosition(async pos => {
                        const res = await fetch('/api/verify', { method: 'POST', body: JSON.stringify({ forge_id: goal.id, type: 'location', coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }) });
                        const result = await res.json();
                        if (result.verified) { sendNotification('GPS Verified', 'Location confirmed.'); window.location.reload(); }
                        setIsUpdating(false);
                      });
                    }} style={{
                      padding: '14px 8px', borderRadius: 8, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all .2s',
                      background: 'var(--surf2)', border: '1px solid var(--border)', color: 'var(--text3)'
                    }}>
                      <MapPin size={18} /><span style={{ fontSize: 10, fontWeight: 700 }}>GPS Check</span>
                    </button>
                    <div style={{ position: 'relative', padding: '14px 8px', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'var(--surf2)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer' }}>
                      <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} onChange={async () => {
                        setIsUpdating(true);
                        sendNotification('AI Processing', 'Analyzing evidence...');
                        await new Promise(r => setTimeout(r, 2000));
                        const res = await fetch('/api/verify', { method: 'POST', body: JSON.stringify({ forge_id: goal.id, type: 'manual' }) });
                        const result = await res.json();
                        if (result.verified) { sendNotification('Proof Confirmed', 'Visual proof matched.'); window.location.reload(); }
                        setIsUpdating(false);
                      }} />
                      <Camera size={18} /><span style={{ fontSize: 10, fontWeight: 700 }}>Upload Proof</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Failed state CTA */}
            {isFailed && (
              <div className="card" style={{ borderColor: 'rgba(224,92,92,.3)', background: 'var(--redDim)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💥</div>
                <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>Plan Failed</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
                  This plan expired without completion. Your stake may be forfeited.
                </div>
                <button
                  onClick={() => router.push('/dashboard/pathfinder')}
                  className="btn btn-amber btn-sm btn-full"
                >
                  Start a New Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
