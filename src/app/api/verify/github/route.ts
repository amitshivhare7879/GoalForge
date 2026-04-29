import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS for verification
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

    const { forge_id } = await req.json();

    // 1. Fetch Forge
    const { data: forge, error: forgeError } = await supabaseAdmin
      .from('forges')
      .select('*')
      .eq('id', forge_id)
      .single();

    if (forgeError || !forge) {
      return NextResponse.json({ error: "Forge not found" }, { status: 404 });
    }

    // 2. Fetch User Profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('github_handle')
      .eq('id', forge.user_id)
      .single();

    if (profileError || !profile?.github_handle) {
      return NextResponse.json({ error: "GitHub handle not linked in profile" }, { status: 400 });
    }

    const githubHandle = profile.github_handle;

    // 2. Fetch GitHub Events
    // GitHub API provides public events without an API key (up to 60/hr)
    const ghResponse = await fetch(`https://api.github.com/users/${githubHandle}/events/public`);
    const events = await ghResponse.json();

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Failed to fetch GitHub events" }, { status: 500 });
    }

    // 3. Analyze Events for Today
    const today = new Date().toISOString().split('T')[0];
    const hasActivityToday = events.some((event: any) => {
      const eventDate = event.created_at.split('T')[0];
      return eventDate === today && (event.type === 'PushEvent' || event.type === 'PullRequestEvent' || event.type === 'CreateEvent');
    });

    if (hasActivityToday) {
      // 4. Update Protocol Progress
      const start = new Date(forge.created_at);
      const now = new Date();
      const currentDay = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

      let completedDays = forge.completed_days || [];
      if (!completedDays.includes(currentDay)) {
        completedDays.push(currentDay);

        await supabaseAdmin
          .from('forges')
          .update({ completed_days: completedDays })
          .eq('id', forge_id);

        return NextResponse.json({ success: true, verified: true, day: currentDay });
      }

      return NextResponse.json({ success: true, verified: true, message: "Already verified today" });
    }

    return NextResponse.json({ success: true, verified: false, message: "No activity detected on GitHub for today" });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
