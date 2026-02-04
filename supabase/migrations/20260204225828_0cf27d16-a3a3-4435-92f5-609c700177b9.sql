-- Create subscription_coupons table for premium discounts
CREATE TABLE public.subscription_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percentage INTEGER CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  discount_amount NUMERIC CHECK (discount_amount > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.subscription_coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active coupons (to validate them)
CREATE POLICY "Anyone can view active coupons"
ON public.subscription_coupons
FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage all coupons
CREATE POLICY "Admins can manage coupons"
ON public.subscription_coupons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster code lookups
CREATE INDEX idx_subscription_coupons_code ON public.subscription_coupons(upper(code));

-- Create coupon_usages table to track who used which coupon
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.subscription_coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usages
CREATE POLICY "Users can view their own usages"
ON public.coupon_usages
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own usages
CREATE POLICY "Users can insert their own usages"
ON public.coupon_usages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all usages
CREATE POLICY "Admins can view all usages"
ON public.coupon_usages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_subscription_coupon(coupon_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_coupon RECORD;
  v_user_id UUID;
  v_already_used BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find coupon
  SELECT * INTO v_coupon
  FROM public.subscription_coupons
  WHERE upper(code) = upper(coupon_code)
    AND is_active = true;
  
  IF v_coupon IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid coupon code');
  END IF;
  
  -- Check validity period
  IF v_coupon.valid_from > now() THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon not yet valid');
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon expired');
  END IF;
  
  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon usage limit reached');
  END IF;
  
  -- Check if user already used this coupon
  SELECT EXISTS(
    SELECT 1 FROM public.coupon_usages
    WHERE coupon_id = v_coupon.id AND user_id = v_user_id
  ) INTO v_already_used;
  
  IF v_already_used THEN
    RETURN json_build_object('valid', false, 'error', 'You have already used this coupon');
  END IF;
  
  RETURN json_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'description', v_coupon.description,
    'discount_percentage', v_coupon.discount_percentage,
    'discount_amount', v_coupon.discount_amount
  );
END;
$$;