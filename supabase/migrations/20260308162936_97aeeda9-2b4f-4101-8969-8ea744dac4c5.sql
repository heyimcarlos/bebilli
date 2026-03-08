-- Table to link WhatsApp/Telegram groups to Billi groups
CREATE TABLE public.bot_group_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  platform_group_id text NOT NULL,
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('pt', 'en', 'fr', 'es')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, platform_group_id)
);

-- Table to link phone/telegram usernames to Billi users
CREATE TABLE public.bot_user_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  platform_identifier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, platform_identifier)
);

-- RLS
ALTER TABLE public.bot_group_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_user_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bot_group_links" ON public.bot_group_links
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage bot_user_links" ON public.bot_user_links
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own bot links" ON public.bot_user_links
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own bot links" ON public.bot_user_links
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());