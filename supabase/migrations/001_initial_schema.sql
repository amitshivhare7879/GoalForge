-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extended User Profile
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    forge_score INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    completed_goals INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    avatar_url TEXT,
    bio TEXT,
    is_profile_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('coding', 'fitness', 'location', 'calendar', 'general')),
    status TEXT CHECK (status IN ('active', 'completed', 'failed', 'paused')) DEFAULT 'active',
    difficulty_curve JSONB,
    current_phase INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    stake_amount NUMERIC(10,2) DEFAULT 0,
    verification_config JSONB,
    forge_score_reward INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    phase INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('soft_heat', 'warm', 'hot', 'forge_temp', 'quench')),
    target_value NUMERIC,
    unit TEXT,
    due_date DATE,
    status TEXT CHECK (status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    proof_data JSONB
);

-- Verifications Table
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    method TEXT CHECK (method IN ('github', 'google_calendar', 'gps', 'health', 'simulated')),
    status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    raw_data JSONB,
    verified_at TIMESTAMPTZ DEFAULT now()
);

-- Stakes / Escrow Table
CREATE TABLE IF NOT EXISTS public.stakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('locked', 'released', 'lost')) DEFAULT 'locked',
    lock_date TIMESTAMPTZ DEFAULT now(),
    release_date TIMESTAMPTZ,
    yield_rate NUMERIC(5,4) DEFAULT 0.085,
    buffer_days INTEGER DEFAULT 0,
    simulated BOOLEAN DEFAULT true
);

-- OAuth Connections Table
CREATE TABLE IF NOT EXISTS public.oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT CHECK (provider IN ('github', 'google_calendar', 'health')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    scopes TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create simple trigger mapping auth.users to public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Users can read/write their own data)
CREATE POLICY "Users can view public profiles or their own"
  ON public.users FOR SELECT
  USING (is_profile_public = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view milestones for their goals"
  ON public.milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.goals WHERE id = milestones.goal_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their own verifications"
  ON public.verifications FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stakes"
  ON public.stakes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own oauth connections"
  ON public.oauth_connections FOR ALL
  USING (auth.uid() = user_id);
