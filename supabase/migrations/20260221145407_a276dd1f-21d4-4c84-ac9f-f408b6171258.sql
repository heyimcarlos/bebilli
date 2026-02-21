
-- Add username to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Policies for user_follows
CREATE POLICY "Users can send follow requests"
ON public.user_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can view their own follow relationships"
ON public.user_follows FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can update follow requests they received"
ON public.user_follows FOR UPDATE
USING (auth.uid() = following_id);

CREATE POLICY "Users can delete their own follow relationships"
ON public.user_follows FOR DELETE
USING (auth.uid() = follower_id OR auth.uid() = following_id);
