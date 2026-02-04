-- Drop overly permissive SELECT policies on profiles table
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of group members" ON public.profiles;

-- Keep only the policy that allows users to view their own profile
-- (This policy already exists: "Users can view their own profile")
-- Recreate it to ensure it's correct
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);