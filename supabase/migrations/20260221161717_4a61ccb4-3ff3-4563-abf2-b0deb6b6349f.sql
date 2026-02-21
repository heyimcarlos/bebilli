
-- Fix: Allow admins to update any profile (needed for toggling VIP)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add grants_vip column to subscription_coupons for free VIP coupons
ALTER TABLE public.subscription_coupons
ADD COLUMN grants_vip boolean NOT NULL DEFAULT false;
