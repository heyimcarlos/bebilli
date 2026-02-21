
CREATE OR REPLACE FUNCTION public.validate_subscription_coupon(coupon_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_coupon RECORD;
  v_user_id UUID;
  v_already_used BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_coupon
  FROM public.subscription_coupons
  WHERE upper(code) = upper(coupon_code)
    AND is_active = true;
  
  IF v_coupon IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid coupon code');
  END IF;
  
  IF v_coupon.valid_from > now() THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon not yet valid');
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon expired');
  END IF;
  
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'Coupon usage limit reached');
  END IF;
  
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
    'discount_amount', v_coupon.discount_amount,
    'grants_vip', v_coupon.grants_vip
  );
END;
$function$;
