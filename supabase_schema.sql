-- ============================================================
-- GoalForge Supabase Schema v1.1
-- Run this in the Supabase SQL editor.
-- Use ALTER TABLE statements if the tables already exist.
-- ============================================================

-- Table for Forges (Goals)
CREATE TABLE IF NOT EXISTS public.forges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration_days INT NOT NULL,
    difficulty_curve JSONB DEFAULT '[]',          -- FIX 2.2: was NOT NULL, now nullable with default
    tasks JSONB DEFAULT '[]',
    stake TEXT DEFAULT '₹500',
    progress INT DEFAULT 0,                       -- FIX 3.1: add missing progress column
    completed_days INT[] DEFAULT '{}',
    buffer_days_used INT DEFAULT 0,
    -- FIX 2.2: unified status values (Active, Forged, Broken, completed are all valid)
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Forged', 'Broken', 'active', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrations for existing tables (safe to run even if columns already exist)
ALTER TABLE public.forges ALTER COLUMN difficulty_curve SET DEFAULT '[]';
ALTER TABLE public.forges ALTER COLUMN difficulty_curve DROP NOT NULL;
ALTER TABLE public.forges ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE public.forges DROP CONSTRAINT IF EXISTS forges_status_check;
ALTER TABLE public.forges ADD CONSTRAINT forges_status_check
    CHECK (status IN ('Active', 'Forged', 'Broken', 'active', 'completed', 'failed'));

-- Table for Forge Progress / Daily Checks
CREATE TABLE IF NOT EXISTS public.forge_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forge_id UUID NOT NULL REFERENCES public.forges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_number INT,
    verified BOOLEAN DEFAULT FALSE,
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles for Forge Score
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    forge_score INT DEFAULT 0,
    buffer_days INT DEFAULT 2,
    total_staked NUMERIC DEFAULT 0,
    github_handle TEXT,
    hashnode_handle TEXT,
    linkedin_handle TEXT,
    twitter_handle TEXT,
    leetcode_handle TEXT,
    location JSONB,
    -- FIX M-07: add updated_at trigger
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.forges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own forges." ON public.forges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own logs." ON public.forge_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own profile." ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- ─── updated_at triggers ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_forges_updated_at ON public.forges;
CREATE TRIGGER set_forges_updated_at
  BEFORE UPDATE ON public.forges
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ─── Profile creation on signup ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- App Versioning for APK/PWA Auto-Updates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_name TEXT NOT NULL,          -- e.g., "1.0.0"
    version_code INT NOT NULL,           -- e.g., 1
    download_url TEXT NOT NULL,          -- e.g., GitHub Releases page or direct APK URL
    release_notes TEXT,                  -- What's new in the release
    is_mandatory BOOLEAN DEFAULT false,  -- If true, force update redirect
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Allow public read access so any app instance can check for updates
CREATE POLICY "Allow public read access to app_versions" ON public.app_versions
    FOR SELECT USING (true);

