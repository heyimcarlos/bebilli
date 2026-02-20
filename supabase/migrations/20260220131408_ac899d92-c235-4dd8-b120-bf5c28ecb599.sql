-- Create storage bucket for audio messages
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-messages', 'audio-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload audio
CREATE POLICY "Users can upload audio" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audio-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Anyone can listen to audio" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-messages');

-- Create chat_messages table for group chats (to persist messages + audio)
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text,
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group messages" ON public.chat_messages
FOR SELECT USING (is_group_member(group_id));

CREATE POLICY "Members can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (auth.uid() = user_id AND is_group_member(group_id));

CREATE POLICY "Users can delete own messages" ON public.chat_messages
FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
