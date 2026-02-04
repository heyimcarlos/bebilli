
-- Update the get_group_invite_code function to allow all group members to see the code
CREATE OR REPLACE FUNCTION public.get_group_invite_code(group_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invite_code TEXT;
  v_is_member BOOLEAN;
BEGIN
  -- Check if the user is a member of this group (any role)
  SELECT EXISTS(
    SELECT 1 FROM group_memberships 
    WHERE group_id = group_uuid 
    AND user_id = auth.uid()
  ) INTO v_is_member;
  
  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Only group members can view invite codes';
  END IF;
  
  SELECT invite_code INTO v_invite_code
  FROM groups
  WHERE id = group_uuid;
  
  RETURN v_invite_code;
END;
$function$;
