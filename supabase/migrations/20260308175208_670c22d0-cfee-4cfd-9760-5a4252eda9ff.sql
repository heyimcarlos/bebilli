INSERT INTO public.app_settings (key, value)
VALUES ('whatsapp_phone_number_id', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_settings (key, value)
VALUES ('whatsapp_bot_number', '')
ON CONFLICT (key) DO NOTHING;