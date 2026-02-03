-- Create communities table for thematic groups
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create community_members table for membership
CREATE TABLE public.community_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create community_posts table for forum/chat
CREATE TABLE public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Function to check community membership
CREATE OR REPLACE FUNCTION public.is_community_member(community_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_uuid AND user_id = auth.uid()
  )
$$;

-- Communities policies - anyone can view
CREATE POLICY "Anyone can view communities"
ON public.communities FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create communities"
ON public.communities FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Community members policies
CREATE POLICY "Anyone can view community members count"
ON public.community_members FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join communities"
ON public.community_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
USING (auth.uid() = user_id);

-- Community posts policies - only members can view and post
CREATE POLICY "Members can view community posts"
ON public.community_posts FOR SELECT
USING (is_community_member(community_id));

CREATE POLICY "Members can create posts"
ON public.community_posts FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_community_member(community_id));

CREATE POLICY "Users can delete their own posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;

-- Insert default communities
INSERT INTO public.communities (name, description, image_url, category) VALUES
('Japan Adventure', 'Share tips and experiences about traveling to Japan', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'Travel'),
('Tesla Dream', 'Exchange ideas about electric vehicles and sustainable mobility', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 'Vehicle'),
('Downtown Condo', 'Tips for buying your apartment in the city center', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 'Real Estate'),
('MBA Toronto', 'Share your education journey and career tips', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'Education');