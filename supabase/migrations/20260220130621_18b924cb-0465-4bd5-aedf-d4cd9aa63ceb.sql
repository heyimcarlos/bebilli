
-- Add language and currency columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency text DEFAULT 'CAD';

-- Set admin role for natalia.barros.mattos@gmail.com
-- First find the user and insert the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'natalia.barros.mattos@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
