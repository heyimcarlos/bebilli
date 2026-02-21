DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT id,
    name,
    username,
    avatar_url,
    is_premium,
    consistency_days,
    max_saved,
    level,
    created_at
FROM profiles;