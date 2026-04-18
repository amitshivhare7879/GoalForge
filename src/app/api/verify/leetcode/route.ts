import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { forge_id } = await req.json();

    // 1. Fetch Forge and User Profile
    const { data: forge, error: forgeError } = await supabase
      .from('forges')
      .select('*')
      .eq('id', forge_id)
      .single();

    if (forgeError || !forge) return NextResponse.json({ error: "Forge not found" }, { status: 404 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('leetcode_handle')
      .eq('id', forge.user_id)
      .single();

    if (!profile?.leetcode_handle) {
      return NextResponse.json({ error: "LeetCode handle not linked" }, { status: 400 });
    }

    // 2. Fetch LeetCode Stats
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${profile.leetcode_handle}`);
    const stats = await response.json();

    if (stats.status !== "success") {
      return NextResponse.json({ error: "Failed to fetch LeetCode data" }, { status: 500 });
    }

    // 3. Analyze Submission Calendar
    // submissionCalendar is { "timestamp": count }
    const calendar = JSON.parse(stats.submissionCalendar || "{}");
    
    // Get start of today in seconds
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(startOfToday.getTime() / 1000).toString();

    // The API might store timestamps slightly off due to timezones, 
    // we check for any timestamp within the last 24 hours.
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400;

    const hasActivityToday = Object.keys(calendar).some(ts => {
      const timestamp = parseInt(ts);
      return timestamp >= oneDayAgo && calendar[ts] > 0;
    });

    if (hasActivityToday) {
      const goalStart = new Date(forge.created_at);
      const currentDay = Math.ceil(Math.abs(Date.now() - goalStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;

      let completedDays = forge.completed_days || [];
      if (!completedDays.includes(currentDay)) {
        completedDays.push(currentDay);
        await supabase.from('forges').update({ completed_days: completedDays }).eq('id', forge_id);
      }

      return NextResponse.json({ success: true, verified: true, day: currentDay });
    }

    return NextResponse.json({ success: true, verified: false, message: "No LeetCode submissions found for today." });

  } catch (error) {
    console.error("LeetCode Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
