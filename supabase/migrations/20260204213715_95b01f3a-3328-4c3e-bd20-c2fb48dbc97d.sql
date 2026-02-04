-- Create a secure function to join groups by invite code
-- This bypasses RLS since the user can't see the group before joining
CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(invite_code_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_group_name text;
  v_user_id uuid;
  v_existing_membership uuid;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find the group by invite code (case-insensitive)
  SELECT id, name INTO v_group_id, v_group_name
  FROM public.groups
  WHERE upper(groups.invite_code) = upper(invite_code_input);
  
  IF v_group_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invite code');
  END IF;
  
  -- Check if already a member
  SELECT id INTO v_existing_membership
  FROM public.group_memberships
  WHERE group_id = v_group_id AND user_id = v_user_id;
  
  IF v_existing_membership IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already a member of this group');
  END IF;
  
  -- Join the group
  INSERT INTO public.group_memberships (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'member');
  
  RETURN json_build_object(
    'success', true, 
    'group_id', v_group_id,
    'group_name', v_group_name
  );
END;
$$;