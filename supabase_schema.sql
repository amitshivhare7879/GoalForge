-- Table for Forges (Goals)
CREATE TABLE IF NOT EXISTS public.forges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Coding', 'Fitness', 'Focus'
    duration_days INT NOT NULL,
    difficulty_curve JSONB NOT NULL, -- Stores the AI-generated curve data
    stake TEXT DEFAULT '$0',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Forged', 'Broken')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for Forge Progress / Daily Checks
CREATE TABLE IF NOT EXISTS public.forge_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forge_id UUID NOT NULL REFERENCES public.forges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verified BOOLEAN DEFAULT FALSE,
    evidence_url TEXT, -- URL to API response snapshot or photo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles for Forge Score
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    forge_score INT DEFAULT 0,
    buffer_days INT DEFAULT 2,
    total_staked NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE public.forges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own forges." ON public.forges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own logs." ON public.forge_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own profile." ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
