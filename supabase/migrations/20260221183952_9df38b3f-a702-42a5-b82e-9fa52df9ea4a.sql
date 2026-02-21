
-- Fix security definer views by setting them to SECURITY INVOKER
ALTER VIEW public.groups_public SET (security_invoker = on);
ALTER VIEW public.groups_member_view SET (security_invoker = on);
