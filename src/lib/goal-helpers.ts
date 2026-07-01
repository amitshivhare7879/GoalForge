/**
 * Centralized logic for goal status, progress, and date calculations.
 * SINGLE SOURCE OF TRUTH — all status derivations must go through here.
 *
 * Canonical DB status values written by the app:
 *   'Active'  — goal is ongoing
 *   'Forged'  — goal completed successfully
 *   'Broken'  — goal explicitly failed or abandoned
 */

export type GoalStatus = 'Active' | 'Completed' | 'Failed';

export function deriveGoalStatus(goal: any): GoalStatus {
  if (!goal) return 'Active';

  const s = (goal.status || '').toLowerCase().trim();

  // Completed family — covers 'Forged', 'forged', 'completed', legacy variants
  if (s === 'forged' || s === 'completed' || s === 'quenched') return 'Completed';

  // Failed family — covers 'Broken', 'broken', 'failed', 'forfeited'
  if (s === 'broken' || s === 'failed' || s === 'forfeited') return 'Failed';

  // For Active/blank status: flip to Failed only when the deadline has truly passed.
  // Use floor (not ceil) so a goal on exactly day 0 still shows Active.
  if (goal.created_at && goal.duration_days) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor(
      (Date.now() - new Date(goal.created_at).getTime()) / msPerDay
    );
    if (elapsedDays >= goal.duration_days) return 'Failed';
  }

  return 'Active';
}

/**
 * Returns the 1-based current day within the goal (clamped 1…duration_days).
 */
export function getCurrentDay(goal: any): number {
  if (!goal) return 1;
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Math.floor(
    (Date.now() - new Date(goal.created_at).getTime()) / msPerDay
  );
  return Math.min(Math.max(elapsed + 1, 1), goal.duration_days);
}

/**
 * Returns a 0-100 progress percentage.
 * Completed = 100. Failed = actual days done / total (shows real progress, not 100).
 */
export function getGoalProgress(goal: any, status: GoalStatus): number {
  if (!goal) return 0;
  if (status === 'Completed') return 100;

  // Show real completed-day ratio for failed goals (not a fake 100%)
  if (status === 'Failed') {
    if (!goal.duration_days) return 0;
    return Math.round(((goal.completed_days?.length || 0) / goal.duration_days) * 100);
  }

  // Active: prefer DB-stored progress (set on every task completion)
  if (typeof goal.progress === 'number' && goal.progress > 0) return goal.progress;

  const day = getCurrentDay(goal);
  return Math.round((day / goal.duration_days) * 100) || 2;
}
