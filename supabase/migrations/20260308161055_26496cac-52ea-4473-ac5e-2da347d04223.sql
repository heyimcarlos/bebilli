
-- Add competitive group features
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS competition_end_date timestamp with time zone DEFAULT NULL;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_open_goal boolean NOT NULL DEFAULT false;

-- Add member-level settings for competitive groups
ALTER TABLE public.group_memberships ADD COLUMN IF NOT EXISTS salary numeric DEFAULT NULL;
ALTER TABLE public.group_memberships ADD COLUMN IF NOT EXISTS show_amount boolean NOT NULL DEFAULT true;
ALTER TABLE public.group_memberships ADD COLUMN IF NOT EXISTS checkin_count integer NOT NULL DEFAULT 0;

-- Allow update on group_memberships for members to set their own preferences
CREATE POLICY "Members can update their own membership settings"
ON public.group_memberships
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
