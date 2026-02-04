-- Add hidden_groups table to track which groups users have hidden
CREATE TABLE public.hidden_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  hidden_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Enable RLS
ALTER TABLE public.hidden_groups ENABLE ROW LEVEL SECURITY;

-- Users can view their own hidden groups
CREATE POLICY "Users can view their hidden groups"
ON public.hidden_groups
FOR SELECT
USING (auth.uid() = user_id);

-- Users can hide groups they're members of
CREATE POLICY "Users can hide groups"
ON public.hidden_groups
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_group_member(group_id));

-- Users can unhide groups
CREATE POLICY "Users can unhide groups"
ON public.hidden_groups
FOR DELETE
USING (auth.uid() = user_id);

-- Allow group admins to delete groups
CREATE POLICY "Admins can delete their groups"
ON public.groups
FOR DELETE
USING (is_group_admin(id));