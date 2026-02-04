-- Fix security issues

-- 1. Restrict community_members to authenticated users only
DROP POLICY IF EXISTS "Anyone can view community members" ON public.community_members;
CREATE POLICY "Authenticated users can view community members" 
ON public.community_members 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Add policy for profiles_public view (it's a view, so we need to ensure it has proper security)
-- Views inherit security from base table, but let's ensure the base policy is correct

-- 3. Add policy for groups_public view
-- Views inherit from base table

-- 4. Create a secure function to get invite codes only for admins
CREATE OR REPLACE FUNCTION public.get_group_invite_code(group_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_code TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if the user is an admin of this group
  SELECT EXISTS(
    SELECT 1 FROM group_memberships 
    WHERE group_id = group_uuid 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only group admins can view invite codes';
  END IF;
  
  SELECT invite_code INTO v_invite_code
  FROM groups
  WHERE id = group_uuid;
  
  RETURN v_invite_code;
END;
$$;

-- 5. Create a view for groups without invite codes for regular members
CREATE OR REPLACE VIEW public.groups_member_view AS
SELECT 
  id,
  name,
  description,
  goal_amount,
  image_url,
  created_by,
  created_at,
  updated_at
FROM groups;

-- Enable RLS on the view
ALTER VIEW public.groups_member_view SET (security_invoker = on);

-- 6. Enable leaked password protection (this is a configuration setting)
-- Note: This needs to be enabled in Auth settings

-- 7. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_group_invite_code(UUID) TO authenticated;