-- FITYNN - Complete Database Setup for Supabase
-- Execute this entire script in the Supabase SQL Editor

-- 1. Create profiles table extending auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies for profiles (without group dependencies)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Allow all authenticated users to view profiles for now
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for groups - allow all authenticated users for now
CREATE POLICY "groups_select_authenticated"
  ON public.groups FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "groups_insert_own"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update_creator"
  ON public.groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "groups_delete_creator"
  ON public.groups FOR DELETE
  USING (auth.uid() = created_by);

-- 3. Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Enable RLS for group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for group_members
CREATE POLICY "group_members_select_authenticated"
  ON public.group_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "group_members_insert_authenticated"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "group_members_update_own"
  ON public.group_members FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "group_members_delete_own"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- 4. Create competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('weight_loss', 'measurement')),
  measurement_type TEXT CHECK (measurement_type IN ('waist', 'chest', 'arms', 'legs', 'hips')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (end_date > start_date),
  CHECK (type = 'weight_loss' OR measurement_type IS NOT NULL)
);

-- Enable RLS for competitions
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for competitions
CREATE POLICY "competitions_select_authenticated"
  ON public.competitions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "competitions_insert_authenticated"
  ON public.competitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "competitions_update_creator"
  ON public.competitions FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "competitions_delete_creator"
  ON public.competitions FOR DELETE
  USING (auth.uid() = created_by);

-- 5. Create competition_participants table
CREATE TABLE IF NOT EXISTS public.competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_weight NUMERIC(5,2),
  initial_measurement NUMERIC(5,2),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(competition_id, user_id)
);

-- Enable RLS for competition_participants
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for competition_participants
CREATE POLICY "competition_participants_select_authenticated"
  ON public.competition_participants FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "competition_participants_insert_own"
  ON public.competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "competition_participants_update_own"
  ON public.competition_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "competition_participants_delete_own"
  ON public.competition_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create measurements table
CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC(5,2),
  measurement_value NUMERIC(5,2),
  photo_url TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for measurements
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for measurements
CREATE POLICY "measurements_select_authenticated"
  ON public.measurements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "measurements_insert_own"
  ON public.measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "measurements_update_own"
  ON public.measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "measurements_delete_own"
  ON public.measurements FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create posts table for social feed
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  photo_url TEXT,
  measurement_id UUID REFERENCES public.measurements(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for posts
CREATE POLICY "posts_select_authenticated"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "posts_insert_own"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Create group_invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(group_id, invited_email)
);

-- Enable RLS for group_invitations
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies for group_invitations
CREATE POLICY "group_invitations_select_authenticated"
  ON public.group_invitations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "group_invitations_insert_authenticated"
  ON public.group_invitations FOR INSERT
  WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "group_invitations_update_invited"
  ON public.group_invitations FOR UPDATE
  USING (invited_user_id = auth.uid() OR auth.uid() = invited_by);

CREATE POLICY "group_invitations_delete_authenticated"
  ON public.group_invitations FOR DELETE
  USING (invited_user_id = auth.uid() OR auth.uid() = invited_by);

-- 9. Create post_likes table for social features
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_likes
CREATE POLICY "post_likes_select_authenticated"
  ON public.post_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "post_likes_insert_own"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes_delete_own"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_competitions_group_id ON public.competitions(group_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition_id ON public.competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_id ON public.competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_competition_id ON public.measurements(competition_id);
CREATE INDEX IF NOT EXISTS idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON public.group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_user_id ON public.group_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_email ON public.group_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- 11. Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Fitynn database setup completed successfully! All tables, RLS policies, indexes, and triggers have been created.' AS status;
