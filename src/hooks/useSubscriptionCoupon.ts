import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CouponValidation {
  valid: boolean;
  error?: string;
  coupon_id?: string;
  code?: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
}

export const useSubscriptionCoupon = () => {
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  const validateCoupon = async (code: string): Promise<CouponValidation> => {
    if (!code.trim()) {
      return { valid: false, error: 'Please enter a coupon code' };
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('validate_subscription_coupon', { coupon_code: code.trim() });

      if (error) {
        setLoading(false);
        return { valid: false, error: error.message };
      }

      const result = data as unknown as CouponValidation;
      
      if (result.valid) {
        setAppliedCoupon(result);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      return { valid: false, error: 'Failed to validate coupon' };
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
  };

  const calculateDiscount = (originalPrice: number): number => {
    if (!appliedCoupon?.valid) return originalPrice;
    
    if (appliedCoupon.discount_percentage) {
      return originalPrice * (1 - appliedCoupon.discount_percentage / 100);
    }
    
    if (appliedCoupon.discount_amount) {
      return Math.max(0, originalPrice - appliedCoupon.discount_amount);
    }
    
    return originalPrice;
  };

  const getDiscountLabel = (): string => {
    if (!appliedCoupon?.valid) return '';
    
    if (appliedCoupon.discount_percentage) {
      return `${appliedCoupon.discount_percentage}% OFF`;
    }
    
    if (appliedCoupon.discount_amount) {
      return `$${appliedCoupon.discount_amount} OFF`;
    }
    
    return '';
  };

  return {
    loading,
    appliedCoupon,
    validateCoupon,
    clearCoupon,
    calculateDiscount,
    getDiscountLabel,
  };
};
