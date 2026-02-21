
-- First drop dependent views
DROP VIEW IF EXISTS public.groups_public;
DROP VIEW IF EXISTS public.groups_member_view;

-- Add category column
ALTER TABLE public.groups ADD COLUMN category text NOT NULL DEFAULT 'other';

-- Recreate views with all columns including category
CREATE VIEW public.groups_public AS
SELECT id, goal_amount, created_by, created_at, updated_at, group_type, name, description, image_url, category
FROM public.groups;

CREATE VIEW public.groups_member_view AS
SELECT id, goal_amount, created_by, created_at, updated_at, description, group_type, image_url, name, category
FROM public.groups
WHERE id IN (SELECT group_id FROM public.group_memberships WHERE user_id = auth.uid());

-- Update create_group_with_admin RPC to accept category
CREATE OR REPLACE FUNCTION public.create_group_with_admin(
  group_name text, 
  group_goal_amount numeric, 
  group_image_url text DEFAULT NULL, 
  group_description text DEFAULT NULL, 
  group_type text DEFAULT 'shared',
  group_category text DEFAULT 'other'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_group_id uuid;
  v_invite_code text;
  v_group_type text;
  v_category text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  v_group_type := COALESCE(group_type, 'shared');
  IF v_group_type NOT IN ('individual', 'shared') THEN v_group_type := 'shared'; END IF;
  
  v_category := COALESCE(group_category, 'other');
  IF v_category NOT IN ('travel', 'real_estate', 'investment', 'education', 'credit_card', 'other') THEN v_category := 'other'; END IF;
  
  v_invite_code := upper(substring(md5(random()::text) from 1 for 6));
  
  INSERT INTO public.groups (name, description, goal_amount, image_url, created_by, invite_code, group_type, category)
  VALUES (group_name, group_description, group_goal_amount, group_image_url, v_user_id, v_invite_code, v_group_type, v_category)
  RETURNING id INTO v_group_id;
  
  INSERT INTO public.group_memberships (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');
  
  RETURN json_build_object(
    'success', true,
    'group_id', v_group_id,
    'group_name', group_name,
    'invite_code', v_invite_code,
    'group_type', v_group_type,
    'category', v_category
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;
