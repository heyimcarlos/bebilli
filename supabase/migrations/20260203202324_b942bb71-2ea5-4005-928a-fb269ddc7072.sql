-- 1. Fix groups_public view - REMOVE invite_code to prevent unauthorized group access
DROP VIEW IF EXISTS public.groups_public;

CREATE VIEW public.groups_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    name,
    goal_amount,
    image_url,
    created_by,
    created_at,
    updated_at
    -- invite_code is intentionally excluded for security
  FROM public.groups;

-- 2. Fix profiles_public view - Only expose truly public information with proper security
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    name,
    avatar_url,
    is_premium,
    consistency_days,
    max_saved,
    level,
    created_at
    -- Excluded: phone, country, city (PII that shouldn't be public)
  FROM public.profiles;

-- 3. Add RLS policy for profiles table to allow viewing public profiles only for authenticated users
-- First check if policy exists and drop it
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Create policy that only allows authenticated users to see profiles
CREATE POLICY "Authenticated users can view basic profile info"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own profile
    auth.uid() = id
    OR
    -- Or profiles of people they share a group with
    shares_group_with(id)
  );