import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Auth check: verify user session
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forge_id, type } = await req.json();

    // 1. Fetch Forge and User Profile
    const { data: forge, error: forgeError } = await supabaseAdmin
      .from('forges')
      .select('*')
      .eq('id', forge_id)
      .single();

    if (forgeError || !forge) return NextResponse.json({ error: 'Forge not found' }, { status: 404 });

    // Security: ensure the authenticated user owns this forge
    if (forge.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', forge.user_id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const goalStart = new Date(forge.created_at);
    const currentDay = Math.ceil(Math.abs(Date.now() - goalStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    let verified = false;
    let message = '';

    // 2. Routing based on type
    switch (type) {
      case 'github': {
        if (!profile.github_handle) {
          return NextResponse.json({
            verified: false,
            message: 'No GitHub handle configured. Add it in Settings → Verifications.',
          });
        }
        try {
          const ghRes = await fetch(
            `https://api.github.com/users/${profile.github_handle}/events/public`,
            { headers: { 'User-Agent': 'GoalForge-Verifier' } }
          );
          if (!ghRes.ok) throw new Error(`GitHub API returned ${ghRes.status}`);
          const ghEvents = await ghRes.json();
          const ghToday = new Date().toISOString().split('T')[0];
          verified = Array.isArray(ghEvents) && ghEvents.some((e: any) => e.created_at?.startsWith(ghToday));
          message = verified ? 'GitHub activity detected today.' : 'No GitHub commits or activity found today.';
        } catch (err) {
          console.error('GitHub verification error:', err);
          return NextResponse.json({ verified: false, message: 'GitHub service temporarily unavailable — try again later.' });
        }
        break;
      }

      case 'leetcode': {
        if (!profile.leetcode_handle) {
          return NextResponse.json({
            verified: false,
            message: 'No LeetCode handle configured. Add it in Settings → Verifications.',
          });
        }
        try {
          const lcRes = await fetch(
            `https://leetcode-stats-api.herokuapp.com/${profile.leetcode_handle}`
          );
          if (!lcRes.ok) throw new Error(`LeetCode stats API returned ${lcRes.status}`);
          const lcStats = await lcRes.json();
          const calendar = JSON.parse(lcStats.submissionCalendar || '{}');
          const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
          verified = Object.keys(calendar).some(ts => parseInt(ts) >= oneDayAgo);
          message = verified ? 'LeetCode submission found in the last 24 hours.' : 'No LeetCode submissions in the last 24 hours.';
        } catch (err) {
          console.warn('LeetCode service unavailable:', err);
          return NextResponse.json({
            verified: false,
            message: 'LeetCode service temporarily unavailable — try again later.',
          });
        }
        break;
      }

      // FIX 3.5: Hashnode RSS date matching was broken. Replaced with a more robust check.
      case 'hashnode': {
        if (!profile.hashnode_handle) {
          return NextResponse.json({
            verified: false,
            message: 'No Hashnode handle configured. Add it in Settings → Verifications.',
          });
        }
        try {
          const handle = profile.hashnode_handle.replace(/^@/, '');
          const hnRes = await fetch(`https://${handle}.hashnode.dev/rss.xml`);
          if (!hnRes.ok) throw new Error(`Hashnode returned ${hnRes.status}`);
          const hnText = await hnRes.text();
          // Look for a pubDate within the last 24 hours using ISO-style date detection
          const todayStr = new Date().toUTCString().substring(0, 16); // "Sat, 03 May 2026"
          const yesterdayStr = new Date(Date.now() - 86400000).toUTCString().substring(0, 16);
          verified = hnText.includes(todayStr) || hnText.includes(yesterdayStr);
          message = verified ? 'New Hashnode post published in the last 24 hours.' : 'No new Hashnode post in the last 24 hours.';
        } catch (err) {
          console.warn('Hashnode verification error:', err);
          return NextResponse.json({ verified: false, message: 'Hashnode service temporarily unavailable — try again later.' });
        }
        break;
      }

      // FIX 3.5: Removed fake Twitter verification (always-true). Out of scope for MVP.
      // FIX 2.5: Removed always-true 'manual' and 'location' cases.
      // These verification types are removed until real implementations exist.

      default:
        return NextResponse.json(
          { error: `Unsupported verification type: "${type}". Supported types: github, leetcode, hashnode.` },
          { status: 400 }
        );
    }

    if (verified) {
      let completedDays: number[] = forge.completed_days || [];
      const currentDayCapped = Math.min(currentDay, forge.duration_days);

      if (!completedDays.includes(currentDayCapped)) {
        completedDays = [...completedDays, currentDayCapped];
      }

      // Progress: only increases, never decreases, caps at 100
      const rawProgress = Math.round((completedDays.length / forge.duration_days) * 100);
      const newProgress = Math.min(100, Math.max(forge.progress || 0, rawProgress));
      const isNowComplete = newProgress >= 100;

      const forgeUpdate: any = { completed_days: completedDays, progress: newProgress };
      // FIX 2.2: Use canonical 'Forged' status (not 'completed')
      if (isNowComplete) forgeUpdate.status = 'Forged';

      await supabaseAdmin.from('forges').update(forgeUpdate).eq('id', forge_id);

      if (isNowComplete) {
        // +50 Forge Score on completion, capped at 1000
        const newScore = Math.min(1000, (profile.forge_score || 0) + 50);
        await supabaseAdmin.from('profiles').update({ forge_score: newScore }).eq('id', forge.user_id);
        message = `Goal complete! +50 Forge Score awarded. ${message}`;
      }

      return NextResponse.json({ success: true, verified: true, day: currentDayCapped, progress: newProgress, completed: isNowComplete, message });
    }

    return NextResponse.json({ success: true, verified: false, message });

  } catch (error) {
    console.error('Universal Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
