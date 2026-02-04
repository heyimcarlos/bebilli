-- Drop and recreate views with security_invoker instead of security_definer

-- Recreate profiles_public view with security_invoker=on
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
FROM public.profiles;

-- Recreate groups_public view with security_invoker=on  
DROP VIEW IF EXISTS public.groups_public;
CREATE VIEW public.groups_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  description,
  image_url,
  goal_amount,
  created_by,
  created_at,
  updated_at
FROM public.groups;