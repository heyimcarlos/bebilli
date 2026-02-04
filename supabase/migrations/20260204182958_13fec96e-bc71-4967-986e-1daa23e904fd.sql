-- Add image_url to community_posts for photo sharing
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create post_replies table for reply threads
CREATE TABLE IF NOT EXISTS public.post_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on post_replies
ALTER TABLE public.post_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_replies
CREATE POLICY "Anyone can view replies in communities they're members of"
ON public.post_replies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts cp
    JOIN public.community_members cm ON cp.community_id = cm.community_id
    WHERE cp.id = post_replies.post_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Members can create replies"
ON public.post_replies FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.community_posts cp
    JOIN public.community_members cm ON cp.community_id = cm.community_id
    WHERE cp.id = post_replies.post_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own replies"
ON public.post_replies FOR DELETE
USING (auth.uid() = user_id);

-- Create partners table for admin management
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner_coupons table
CREATE TABLE IF NOT EXISTS public.partner_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage INTEGER,
  discount_amount NUMERIC(10,2),
  min_level INTEGER NOT NULL DEFAULT 1,
  min_group_progress INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Public can view active partners
CREATE POLICY "Anyone can view active partners"
ON public.partners FOR SELECT
USING (is_active = true);

-- Enable RLS on partner_coupons
ALTER TABLE public.partner_coupons ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view active coupons
CREATE POLICY "Authenticated users can view active coupons"
ON public.partner_coupons FOR SELECT
TO authenticated
USING (is_active = true);

-- Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admins can manage partners
CREATE POLICY "Admins can manage partners"
ON public.partners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons"
ON public.partner_coupons FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_replies;