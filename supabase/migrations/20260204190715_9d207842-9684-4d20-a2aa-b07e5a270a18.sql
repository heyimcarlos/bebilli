-- Fix profiles RLS to allow viewing profiles in shared contexts (groups/communities)
-- This restores social features while maintaining privacy for sensitive fields via profiles_public view

-- Create function to check if users share a community
CREATE OR REPLACE FUNCTION public.shares_community_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.community_members cm1
    INNER JOIN public.community_members cm2 ON cm1.community_id = cm2.community_id
    WHERE cm1.user_id = auth.uid() 
      AND cm2.user_id = target_user_id
  )
$$;

-- Add policy to allow viewing profiles in shared context (group or community membership)
CREATE POLICY "Users can view profiles in shared context"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR public.shares_group_with(id)
  OR public.shares_community_with(id)
);