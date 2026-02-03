-- Create reactions table for community posts
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Members can view reactions on posts they can see
CREATE POLICY "Members can view reactions"
ON public.post_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts cp
    WHERE cp.id = post_id
    AND is_community_member(cp.community_id)
  )
);

-- Users can add reactions to posts they can see
CREATE POLICY "Users can add reactions"
ON public.post_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.community_posts cp
    WHERE cp.id = post_id
    AND is_community_member(cp.community_id)
  )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
ON public.post_reactions
FOR DELETE
USING (auth.uid() = user_id);