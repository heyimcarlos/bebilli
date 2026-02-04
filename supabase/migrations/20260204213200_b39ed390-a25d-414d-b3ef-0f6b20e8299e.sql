-- Allow admins to view all groups (regardless of membership)
CREATE POLICY "Admins can view all groups"
ON public.groups FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all group memberships
CREATE POLICY "Admins can view all memberships"
ON public.group_memberships FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all contributions
CREATE POLICY "Admins can view all contributions"
ON public.contributions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any group (for regenerating codes)
CREATE POLICY "Admins can update any group"
ON public.groups FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));