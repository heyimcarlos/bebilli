-- Create a function to check if two users share a group
CREATE OR REPLACE FUNCTION public.shares_group_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_memberships gm1
    INNER JOIN public.group_memberships gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() 
      AND gm2.user_id = target_user_id
  )
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create new policy: users can view profiles of group members (limited info accessed via app)
CREATE POLICY "Users can view profiles of group members"
ON public.profiles
FOR SELECT
USING (public.shares_group_with(id));