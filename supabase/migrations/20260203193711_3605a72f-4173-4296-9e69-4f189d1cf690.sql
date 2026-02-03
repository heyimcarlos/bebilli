-- Fix 1: Create a view for groups that hides invite_code from non-admins
-- First, create a public view that conditionally shows invite_code
CREATE OR REPLACE VIEW public.groups_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  image_url,
  goal_amount,
  created_by,
  created_at,
  updated_at,
  CASE 
    WHEN public.is_group_admin(id) THEN invite_code 
    ELSE NULL 
  END as invite_code
FROM public.groups;

-- Fix 2: Allow users to leave groups (delete their own membership)
CREATE POLICY "Users can leave groups"
ON public.group_memberships
FOR DELETE
USING (auth.uid() = user_id);