
-- Add source column to contributions to track where they came from
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'app';

-- Create app_settings table for admin-configurable settings like WhatsApp bot number
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "Anyone can read app_settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage app_settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default WhatsApp bot number setting
INSERT INTO public.app_settings (key, value) VALUES ('whatsapp_bot_number', '') ON CONFLICT (key) DO NOTHING;
