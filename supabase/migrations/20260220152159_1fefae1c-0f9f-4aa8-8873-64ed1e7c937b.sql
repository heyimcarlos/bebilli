
-- Add premium_only flag to partner_coupons
ALTER TABLE public.partner_coupons 
ADD COLUMN premium_only boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.partner_coupons.premium_only IS 'If true, only premium users can see/use this coupon';
