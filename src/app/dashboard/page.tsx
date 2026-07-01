'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Flame, ShieldCheck, CheckCircle2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deriveGoalStatus, getCurrentDay } from '@/lib/goal-helpers';


function parseStake(raw: any): number {
  return parseFloat(String(raw || '0').replace(/[^0-9.]/g, '')) || 0;
}

function getRank(score: number): string {
  if (score >= 900) return 'Grandmaster';
  if (score >= 700) return 'Champion';
  if (score >= 500) return 'Journeyman';
  if (score >= 250) return 'Apprentice';
  return 'Initiate';
}

// ── helpers ──────────────────────────────────────────────
type TaskEntry = { task: string; forge: any; day: number; done: boolean };
type TasksByDate = Map<string, TaskEntry[]>;

function gcalUrl(task: string, dateStr: string) {
  const d = dateStr.replace(/-/g, '');
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task)}&dates=${d}/${d}`;
}

// ── CalendarModal ─────────────────────────────────────────
function CalendarModal({ tasksByDate, onClose }: { tasksByDate: TasksByDate; onClose: () => void }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const year        = viewMonth.getFullYear();
  const month       = viewMonth.getMonth();
  const today       = new Date().toISOString().split('T')[0];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();
  const monthName   = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const heads       = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const prevMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1));
  const nextMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1));

  const selectedTasks = tasksByDate.get(selectedDate) || [];

  // Build all tasks for "Export all" to Google Calendar
  const allGcalLinks = Array.from(tasksByDate.entries()).flatMap(([date, tasks]) =>
    tasks.map(t => gcalUrl(t.task, date))
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 16, width: '100%', maxWidth: 820,
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,.6)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={prevMonth} style={{ background: 'var(--surf2)', border: '1px solid var(--border)', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', color: 'var(--text2)', fontSize: 16 }}>‹</button>
            <div style={{ fontSize: 17, fontWeight: 700, minWidth: 160, textAlign: 'center' }}>{monthName}</div>
            <button onClick={nextMonth} style={{ background: 'var(--surf2)', border: '1px solid var(--border)', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', color: 'var(--text2)', fontSize: 16 }}>›</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {allGcalLinks.length > 0 && (
              <button onClick={() => allGcalLinks.forEach((url, i) => setTimeout(() => window.open(url, '_blank'), i * 300))}
                style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', background: 'var(--amberDim)', color: 'var(--amber)', border: '1px solid rgba(245,166,35,.3)' }}>
                📅 Export all to Google Calendar
              </button>
            )}
            <button onClick={onClose} style={{ background: 'var(--surf2)', border: '1px solid var(--border)', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', color: 'var(--text2)', fontSize: 18 }}>×</button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Calendar grid */}
          <div style={{ flex: 1, padding: 20, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {heads.map((h, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text3)', paddingBottom: 4 }}>{h}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d     = i + 1;
                const dStr  = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const tasks = tasksByDate.get(dStr) || [];
                const isToday    = dStr === today;
                const isSelected = dStr === selectedDate;
                const hasTasks   = tasks.length > 0;
                return (
                  <div key={d} onClick={() => setSelectedDate(dStr)} style={{
                    minHeight: 52, borderRadius: 8, padding: '6px 6px 4px',
                    cursor: 'pointer', transition: 'all .15s',
                    background: isSelected ? 'var(--amberDim)' : isToday ? 'rgba(245,166,35,.08)' : 'var(--bg3)',
                    border: `1px solid ${isSelected ? 'rgba(245,166,35,.5)' : isToday ? 'rgba(245,166,35,.2)' : 'var(--border)'}`,
                  }}>
                    <div style={{
                      fontSize: 12, fontWeight: isToday ? 800 : 500,
                      color: isToday ? 'var(--amber)' : 'var(--text2)',
                      marginBottom: 4
                    }}>{d}</div>
                    {tasks.slice(0, 2).map((t, idx) => (
                      <div key={idx} style={{
                        fontSize: 9, lineHeight: 1.3, padding: '2px 5px', borderRadius: 4,
                        background: t.done ? 'var(--greenDim)' : 'var(--amberDim)',
                        color: t.done ? 'var(--green)' : 'var(--amber)',
                        marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{t.task}</div>
                    ))}
                    {tasks.length > 2 && (
                      <div style={{ fontSize: 9, color: 'var(--text3)' }}>+{tasks.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          <div style={{ width: 260, padding: 20, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            {selectedTasks.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>No tasks this day</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedTasks.map((t, idx) => (
                  <div key={idx} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: t.done ? 'var(--greenDim)' : 'var(--bg3)',
                    border: `1px solid ${t.done ? 'rgba(77,179,126,.2)' : 'var(--border)'}`
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: t.done ? 'var(--green)' : 'var(--text)' }}>
                      {t.done ? '✓ ' : ''}{t.task}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>
                      {t.forge.title} · Day {t.day}
                    </div>
                    <a href={gcalUrl(t.task, selectedDate)} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', textDecoration: 'none',
                        background: 'var(--amberDim)', padding: '3px 8px', borderRadius: 6,
                        border: '1px solid rgba(245,166,35,.2)', display: 'inline-block' }}>
                      📅 Add to Google Calendar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MiniCalendar ──────────────────────────────────────────
function MiniCalendar({ tasksByDate, onOpen }: { tasksByDate: TasksByDate; onOpen: () => void }) {
  const now         = new Date();
  const year        = now.getFullYear();
  const month       = now.getMonth();
  const today       = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();
  const monthName   = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const heads       = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const todayStr    = now.toISOString().split('T')[0];

  return (
    <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{monthName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, background: 'var(--amberDim)', padding: '2px 10px', borderRadius: 99 }}>{today}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>Open ↗</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {heads.map((h, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text3)', paddingBottom: 6 }}>{h}</div>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d    = i + 1;
          const dStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const tasks = tasksByDate.get(dStr) || [];
          const isToday = dStr === todayStr;
          const isPast  = d < today;
          const hasTasks = tasks.length > 0;
          return (
            <div key={d} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              height: 36, borderRadius: 7, fontSize: 12, fontWeight: isToday ? 800 : 400,
              transition: 'all .15s',
              background: isToday ? 'var(--amber)' : hasTasks ? 'var(--amberDim)' : 'transparent',
              color: isToday ? '#0b0b0d' : isPast ? 'var(--text3)' : hasTasks ? 'var(--amber)' : 'var(--text2)',
              border: hasTasks && !isToday ? '1px solid rgba(245,166,35,.2)' : '1px solid transparent',
              justifyContent: 'center', gap: 2, position: 'relative'
            }}>
              {d}
              {hasTasks && !isToday && (
                <div style={{ display: 'flex', gap: 2, position: 'absolute', bottom: 3 }}>
                  {tasks.slice(0, 3).map((_, ti) => (
                    <div key={ti} style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--amber)' }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [forges, setForges]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tracks keys currently being written to DB — blocks duplicate concurrent calls
  const inFlightRef = useRef<Set<string>>(new Set());
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);
      const { data: forgesData } = await supabase.from('forges').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (forgesData) {
        setForges(forgesData);
        // Hydrate completedMap from completed_days arrays
        const map: Record<string, boolean> = {};
        forgesData.forEach((f: any) => {
          (f.completed_days || []).forEach((d: number) => { map[`${f.id}_${d}`] = true; });
        });
        setCompletedMap(map);
      }
      setIsLoading(false);
    })();
  }, []);

  // ── derived stats ──────────────────────────────────────
  const annotated     = forges.map(f => ({ ...f, _status: deriveGoalStatus(f) }));
  const activeForges  = annotated.filter(f => f._status === 'Active');
  const completedForges = annotated.filter(f => f._status === 'Completed');
  const failedForges  = annotated.filter(f => f._status === 'Failed');

  const totalStake     = annotated.reduce((s, f) => s + parseStake(f.stake), 0);
  const forgeScore     = profile?.forge_score || 0;
  const rank           = getRank(forgeScore);
  const completionRate = forges.length > 0
    ? Math.round((completedForges.length / forges.length) * 100)
    : 0;

  // Buffer days: sum across all active forges
  const totalBufferUsed = activeForges.reduce((s, f) => s + (f.buffer_days_used || 0), 0);
  const totalBufferMax  = activeForges.length * 3; // 3 buffer days per forge

  // Today's tasks: for each active forge, find the task for today's day
  const todayTasks = activeForges.flatMap(forge => {
    const day = getCurrentDay(forge);
    const task = (forge.tasks || []).find((t: any) => t.day === day);
    if (!task) return [];
    const key = `${forge.id}_${day}`;
    return [{ forge, day, task: task.task, done: !!completedMap[key], key }];
  });

  // ── Build tasksByDate: maps YYYY-MM-DD → TaskEntry[] for all forges
  const tasksByDate: TasksByDate = new Map();
  annotated.forEach(forge => {
    const startDate = new Date(forge.created_at);
    (forge.tasks || []).forEach((t: any) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + t.day - 1);
      const dStr = date.toISOString().split('T')[0];
      const key  = `${forge.id}_${t.day}`;
      const entry: TaskEntry = { task: t.task, forge, day: t.day, done: !!completedMap[key] };
      if (!tasksByDate.has(dStr)) tasksByDate.set(dStr, []);
      tasksByDate.get(dStr)!.push(entry);
    });
  });

  const markComplete = async (key: string, forgeId: string, day: number) => {
    // Bail immediately if already done (optimistic) or already in-flight for this key
    if (completedMap[key] || inFlightRef.current.has(key)) return;
    inFlightRef.current.add(key);

    // Optimistic UI update
    const updated = { ...completedMap, [key]: true };
    setCompletedMap(updated);

    const forge = forges.find(f => f.id === forgeId);
    if (!forge) { inFlightRef.current.delete(key); return; }

    const newDays = [...new Set([...(forge.completed_days || []), day])]; // dedup just in case
    const { error } = await supabase.from('forges').update({ completed_days: newDays }).eq('id', forgeId);

    if (error) {
      // Rollback optimistic update on failure
      setCompletedMap(prev => { const r = { ...prev }; delete r[key]; return r; });
    } else {
      setForges(prev => prev.map(f => f.id === forgeId ? { ...f, completed_days: newDays } : f));
    }
    inFlightRef.current.delete(key);
  };

  const [calendarOpen, setCalendarOpen] = useState(false);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Forger';

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text3)' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div className="view active" id="view-dashboard">
      {/* ── Header ── */}
      <div className="view-header flex-between">
        <div>
          <div className="view-h serif">
            {getGreeting()}, <em style={{ color: 'var(--amber)' }}>{firstName}.</em>
          </div>
          <div className="view-sub">
            {activeForges.length > 0
              ? `${activeForges.length} active plan${activeForges.length > 1 ? 's' : ''} · ${todayTasks.filter(t => !t.done).length} task${todayTasks.filter(t => !t.done).length !== 1 ? 's' : ''} due today`
              : 'No active plans. Time to forge something new?'}
          </div>
        </div>
        <button className="btn btn-amber" onClick={() => router.push('/dashboard/pathfinder')}>
          <Plus size={16} /> Forge new goal
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-lbl">Active Plans</div>
          <div className="stat-card-val serif" style={{ color: 'var(--amber)' }}>{activeForges.length}</div>
          <div className="stat-card-sub" style={{ color: failedForges.length > 0 ? 'var(--red)' : 'var(--text2)' }}>
            {failedForges.length > 0 ? `${failedForges.length} failed` : 'All on track'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Completed</div>
          <div className="stat-card-val serif" style={{ color: 'var(--green)' }}>{completedForges.length}</div>
          <div className="stat-card-sub">{completionRate}% completion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Stake Locked</div>
          <div className="stat-card-val serif">
            {totalStake >= 1000 ? `₹${(totalStake / 1000).toFixed(1)}K` : `₹${totalStake}`}
          </div>
          <div className="stat-card-sub up">Across {activeForges.length} active plan{activeForges.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-lbl">Forge Score</div>
          <div className="stat-card-val serif" style={{ color: 'var(--amber)' }}>{forgeScore}</div>
          <div className="stat-card-sub up">{rank}</div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Active Goals */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Active Plans</div>
              <span className="badge badge-amber">{activeForges.length} live</span>
            </div>
            <div className="goal-list">
              {activeForges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
                  No active plans. <span style={{ color: 'var(--amber)', cursor: 'pointer' }} onClick={() => router.push('/dashboard/pathfinder')}>Create one →</span>
                </div>
              ) : (
                activeForges.map(forge => {
                  const day      = getCurrentDay(forge);
                  const progress = Math.round((day / forge.duration_days) * 100) || 2;
                  const daysLeft = Math.max(0, forge.duration_days - day);
                  const stakeDisplay = String(forge.stake || '₹0').replace(/^₹/, '');
                  return (
                    <div key={forge.id} className="goal-card card-hover" onClick={() => router.push(`/dashboard/goals/${forge.id}`)}>
                      <div className="goal-card-header">
                        <div>
                          <div className="goal-card-title">{forge.title}</div>
                          <div className="goal-card-meta">{forge.category} · Day {day} of {forge.duration_days}</div>
                        </div>
                        <span className="badge badge-steel">{forge.category?.toUpperCase()}</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill prog-amber" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="goal-card-footer">
                        <span className="goal-prog-label">{progress}% · {daysLeft} days left</span>
                        <span className="goal-prog-val">₹{stakeDisplay} staked</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Failed plans notice */}
            {failedForges.length > 0 && (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: 8,
                background: 'var(--redDim)', border: '1px solid rgba(224,92,92,.2)',
                fontSize: 13, color: 'var(--red)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span>⚠ {failedForges.length} plan{failedForges.length > 1 ? 's' : ''} failed</span>
                <button
                  onClick={() => router.push('/dashboard/plans')}
                  style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View →
                </button>
              </div>
            )}
          </div>

          {/* Today's Tasks — fully dynamic */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Today's Tasks</div>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="task-list">
              {todayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
                  {activeForges.length === 0
                    ? 'No active plans — create one to see tasks here.'
                    : "No tasks defined for today's day in your plans."}
                </div>
              ) : (
                todayTasks.map(({ forge, day, task, done, key }) => (
                  <div key={key} className={`task-item${done ? ' done' : ''}`}>
                    <button
                      className={`task-check${done ? ' done' : ''}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!done) await markComplete(key, forge.id, day);
                      }}
                      title={done ? 'Completed' : 'Mark complete'}
                    >
                      {done && <CheckCircle2 size={12} />}
                    </button>
                    <div className="task-body">
                      <div className="task-name">{task}</div>
                      <div className="task-meta">{forge.title} · Day {day} of {forge.duration_days}</div>
                    </div>
                    <div className="task-reward" style={{ background: done ? 'var(--greenDim)' : undefined, color: done ? 'var(--green)' : undefined }}>
                      {done ? '✓ Done' : '+pts'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Forge Score Ring */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 20 }}>
              Forge Score
            </div>
            <div className="forge-score-ring">
              <svg className="forge-score-svg" width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--surf2)" strokeWidth="8" />
                <circle cx="70" cy="70" r="58" fill="none" stroke="var(--amber)" strokeWidth="8"
                  strokeDasharray="364"
                  strokeDashoffset={364 - Math.min((forgeScore / 1000), 1) * 364}
                  strokeLinecap="round"
                />
              </svg>
              <div className="forge-score-text">
                <div className="forge-score-num serif">{forgeScore}</div>
                <div className="forge-score-lbl">/ 1000</div>
              </div>
            </div>
            <div className="forge-rank-pill"><Flame size={12} /> {rank}</div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
              {completionRate}% completion rate · {forges.length} total plans
            </p>
          </div>

          {/* Buffer Days */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Buffer Days</div>
            {activeForges.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>No active plans.</p>
            ) : (
              <>
                <div className="buffer-tokens">
                  {Array.from({ length: totalBufferMax }).map((_, i) => (
                    <div key={i} className={`buffer-token${i < totalBufferUsed ? ' used' : ''}`} title={i < totalBufferUsed ? 'Used' : 'Available'} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginTop: 8 }}>
                  {totalBufferUsed} of {totalBufferMax} used across your active plans.
                </p>
              </>
            )}
          </div>

          {/* Verification APIs */}
          <VerificationAPIs profile={profile} onProfileUpdate={setProfile} />

          {/* Mini Calendar */}
          <MiniCalendar tasksByDate={tasksByDate} onOpen={() => setCalendarOpen(true)} />

          {/* Calendar Modal */}
          {calendarOpen && <CalendarModal tasksByDate={tasksByDate} onClose={() => setCalendarOpen(false)} />}
        </div>
      </div>
    </div>
  );
}
// ── Verification APIs Widget ─────────────────────────────────
function VerificationAPIs({ profile, onProfileUpdate }: { profile: any; onProfileUpdate: (p: any) => void }) {
  const supabase = createClient();
  const [inputOpen, setInputOpen] = useState<string | null>(null);
  const [inputVal, setInputVal]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'unknown'|'granted'|'denied'>('unknown');

  // Detect real GPS permission on mount
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then(res => {
      setGpsStatus(res.state === 'granted' ? 'granted' : res.state === 'denied' ? 'denied' : 'unknown');
      res.onchange = () => setGpsStatus(res.state === 'granted' ? 'granted' : res.state === 'denied' ? 'denied' : 'unknown');
    });
  }, []);

  // Real connection checks from profile handles
  const connections = {
    github:   !!profile?.github_handle,
    leetcode: !!profile?.leetcode_handle,
    gps:      gpsStatus === 'granted',
    health:   !!profile?.health_connected,
  };

  const saveHandle = async (field: string, value: string) => {
    if (!value.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const update: any = { [field]: value.trim().replace(/^@/, '') };
    await supabase.from('profiles').update(update).eq('id', user.id);
    onProfileUpdate({ ...profile, ...update });
    setInputOpen(null);
    setInputVal('');
    setSaving(false);
  };

  const disconnectHandle = async (field: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ [field]: null }).eq('id', user.id);
    onProfileUpdate({ ...profile, [field]: null });
  };

  const connectGPS = () => {
    navigator.geolocation.getCurrentPosition(
      () => setGpsStatus('granted'),
      () => setGpsStatus('denied')
    );
  };

  const services = [
    {
      id: 'github', name: 'GitHub', icon: '🐙', bg: '#161b22',
      field: 'github_handle', placeholder: 'your-github-username',
      connected: connections.github, handle: profile?.github_handle,
      label: connections.github ? `@${profile.github_handle}` : 'Passive commit tracking',
    },
    {
      id: 'leetcode', name: 'LeetCode', icon: '⚡', bg: 'rgba(255,161,22,.1)',
      field: 'leetcode_handle', placeholder: 'your-leetcode-username',
      connected: connections.leetcode, handle: profile?.leetcode_handle,
      label: connections.leetcode ? `@${profile.leetcode_handle}` : 'Problem-solving tracking',
    },
    {
      id: 'gps', name: 'GPS / Location', icon: '📍', bg: 'var(--greenDim)',
      field: null, placeholder: '',
      connected: connections.gps, handle: null,
      label: gpsStatus === 'denied' ? 'Permission denied in browser' : connections.gps ? 'Browser permission granted' : 'Physical presence check',
    },
    {
      id: 'health', name: 'Health', icon: '❤️', bg: 'var(--redDim)',
      field: null, placeholder: '',
      connected: connections.health, handle: null,
      label: 'Coming soon',
    },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Verification APIs</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {services.map(svc => (
          <div key={svc.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              border: `1px solid ${svc.connected ? 'rgba(77,179,126,.25)' : 'var(--border)'}`,
              background: svc.connected ? 'rgba(77,179,126,.05)' : 'var(--bg3)',
              transition: 'all .2s',
            }}>
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: svc.bg, fontSize: 18,
              }}>{svc.icon}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{svc.name}</div>
                <div style={{ fontSize: 11, marginTop: 2, color: svc.connected ? 'var(--green)' : svc.id === 'health' ? 'var(--text3)' : 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {svc.connected ? `✓ ${svc.label}` : svc.label}
                </div>
              </div>

              {/* Action */}
              {svc.connected ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--greenDim)', border: '1px solid rgba(77,179,126,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--green)', flexShrink: 0
                  }}>
                    <Check size={13} />
                  </div>
                  {svc.field && (
                    <button onClick={() => disconnectHandle(svc.field!)} style={{
                      fontSize: 10, fontWeight: 700, color: 'var(--red)',
                      background: 'var(--redDim)', padding: '3px 9px',
                      borderRadius: 99, border: '1px solid rgba(224,92,92,.2)', cursor: 'pointer'
                    }}>Remove</button>
                  )}
                </div>
              ) : svc.id === 'health' ? (
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Soon</div>
              ) : svc.id === 'gps' ? (
                <button onClick={connectGPS} style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--amber)',
                  background: 'var(--amberDim)', padding: '5px 12px', borderRadius: 99,
                  border: '1px solid rgba(245,166,35,.2)', cursor: 'pointer'
                }}>Allow</button>
              ) : (
                <button onClick={() => { setInputOpen(svc.id); setInputVal(''); }} style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--amber)',
                  background: 'var(--amberDim)', padding: '5px 12px', borderRadius: 99,
                  border: '1px solid rgba(245,166,35,.2)', cursor: 'pointer'
                }}>Connect</button>
              )}
            </div>

            {/* Inline input for handle-based services */}
            {inputOpen === svc.id && svc.field && (
              <div style={{
                marginTop: 6, padding: '12px 14px', borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border2)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Enter your {svc.name} username</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    autoFocus
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveHandle(svc.field!, inputVal)}
                    placeholder={svc.placeholder}
                    style={{
                      flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)',
                    }}
                  />
                  <button onClick={() => saveHandle(svc.field!, inputVal)} disabled={saving || !inputVal.trim()} style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: 'var(--amber)', color: '#0b0b0d', border: 'none', cursor: 'pointer'
                  }}>{saving ? '...' : 'Save'}</button>
                  <button onClick={() => setInputOpen(null)} style={{
                    padding: '8px', borderRadius: 8, background: 'var(--surf2)',
                    border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text3)'
                  }}><X size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
