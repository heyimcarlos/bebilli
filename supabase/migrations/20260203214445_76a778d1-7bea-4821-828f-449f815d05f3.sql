-- Add description column to groups table
ALTER TABLE public.groups 
ADD COLUMN description text;

-- Update the groups_public view to include description
DROP VIEW IF EXISTS public.groups_public;

CREATE VIEW public.groups_public AS
SELECT 
  id,
  name,
  description,
  image_url,
  goal_amount,
  created_by,
  created_at,
  updated_at
FROM public.groups
WHERE is_group_member(id);