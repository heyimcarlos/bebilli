ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username text;