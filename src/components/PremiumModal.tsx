import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Sparkles, Zap, Shield, Infinity, Tag, Loader2, CheckCircle, XCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscriptionCoupon } from '@/hooks/useSubscriptionCoupon';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'group_limit' | 'feature';
  onSuccess?: () => void;
}

type PlanType = 'monthly' | 'annual';

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, reason = 'group_limit', onSuccess }) => {
  const { t, currency, formatCurrency: fmtCurr } = useApp();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [subscribing, setSubscribing] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  
  // Fixed regional pricing (not converted from CAD)
  const regionalPricing: Record<string, { monthly: number; symbol: string }> = {
    CAD: { monthly: 9.90, symbol: 'CA$' },
    USD: { monthly: 9.99, symbol: 'US$' },
    BRL: { monthly: 9.90, symbol: 'R$' },
  };
  
  const pricing = regionalPricing[currency] || regionalPricing.USD;
  const MONTHLY_PRICE = pricing.monthly;
  const ANNUAL_PRICE = MONTHLY_PRICE * 12 * 0.9;
  const ANNUAL_MONTHLY = ANNUAL_PRICE / 12;
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const { loading, appliedCoupon, validateCoupon, clearCoupon, calculateDiscount, getDiscountLabel, isVipCoupon } = useSubscriptionCoupon();

  const features = [
    { icon: Infinity, text: t('unlimitedGroups') || 'Unlimited groups', highlight: reason === 'group_limit' },
    { icon: Sparkles, text: t('exclusiveBadges') || 'Exclusive badges' },
    { icon: Zap, text: t('prioritySupport') || 'Priority support' },
    { icon: Shield, text: t('advancedAnalytics') || 'Advanced analytics' },
    { icon: Crown, text: t('earlyAccess') || 'Early access to features' },
  ];

  const handleApplyCoupon = async () => {
    setCouponError('');
    const result = await validateCoupon(couponCode);
    if (!result.valid) {
      setCouponError(result.error || 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponCode('');
    setCouponError('');
  };

  const formatPrice = (value: number) => `${pricing.symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2, maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2 })}`;
  
  const basePrice = selectedPlan === 'monthly' ? MONTHLY_PRICE : ANNUAL_MONTHLY;
  const totalPrice = selectedPlan === 'annual' ? ANNUAL_PRICE : MONTHLY_PRICE;
  const finalMonthly = isVipCoupon() ? 0 : calculateDiscount(basePrice);
  const finalTotal = isVipCoupon() ? 0 : calculateDiscount(totalPrice);
  const hasDiscount = appliedCoupon?.valid && (isVipCoupon() || finalMonthly < basePrice);

  // Activate premium: update profile, record coupon usage, create subscription
  const activatePremium = async (amount: number, planType: string, paymentMethod: string) => {
    if (!user) return;
    setSubscribing(true);

    try {
      const now = new Date();
      const renewalDate = planType === 'annual' 
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      // 1. Create subscription record
      const { error: subError } = await supabase.from('user_subscriptions').insert({
        user_id: user.id,
        plan_type: planType,
        amount,
        currency,
        payment_method: paymentMethod,
        coupon_id: appliedCoupon?.coupon_id || null,
        renewal_date: renewalDate.toISOString(),
        expires_at: renewalDate.toISOString(),
        status: 'active',
      });

      if (subError) throw subError;

      // 2. Record coupon usage if coupon was applied
      if (appliedCoupon?.valid && appliedCoupon.coupon_id) {
        await supabase.from('coupon_usages').insert({
          coupon_id: appliedCoupon.coupon_id,
          user_id: user.id,
        });
        // Increment usage count
        await supabase.rpc('validate_subscription_coupon', { coupon_code: '' }).then(() => {});
        // Directly increment
        const { data: couponData } = await supabase
          .from('subscription_coupons')
          .select('current_uses')
          .eq('id', appliedCoupon.coupon_id)
          .single();
        if (couponData) {
          await supabase
            .from('subscription_coupons')
            .update({ current_uses: couponData.current_uses + 1 })
            .eq('id', appliedCoupon.coupon_id);
        }
      }

      // 3. Activate premium on profile
      await supabase.from('profiles').update({ is_premium: true }).eq('id', user.id);

      setRedeemed(true);
      toast({ 
        title: '🎉 ' + (t('premiumActivated') || 'Premium Activated!'),
        description: t('welcomeVip') || 'Welcome to Billi Premium!',
      });
      onSuccess?.();

      // Auto-close after celebration
      setTimeout(() => {
        onClose();
        setRedeemed(false);
      }, 3000);
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribe = async () => {
    if (isVipCoupon()) {
      // Free VIP redemption
      await activatePremium(0, 'monthly', 'coupon');
    } else {
      // Paid subscription
      await activatePremium(finalTotal, selectedPlan, 'card');
    }
  };

  if (!isOpen) return null;

  // Success screen
  if (redeemed) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
            >
              <Crown className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold mb-2"
            >
              🎉 {t('welcomeVip') || 'Welcome to Premium!'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground"
            >
              {t('premiumActivatedDesc') || 'All premium features are now unlocked!'}
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Premium gradient header */}
          <div className="relative h-32 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-card"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </div>

          <div className="px-6 pt-12 pb-6">
            <h2 className="text-2xl font-bold text-center mb-2">Billi Premium</h2>
            
            {reason === 'group_limit' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <p className="text-sm text-destructive font-medium">
                  {t('groupLimitReached') || 'You reached the limit of 4 groups!'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('upgradeToPremium') || 'Upgrade to Premium for unlimited groups'}
                </p>
              </motion.div>
            )}

            <p className="text-center text-muted-foreground mb-6">
              {t('unlockFullPotential') || 'Unlock the full potential of Billi'}
            </p>

            {/* Plan Toggle - hidden if VIP coupon applied */}
            {!isVipCoupon() && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30 hover:border-muted-foreground/30'
                  }`}
                >
                  <p className="text-sm font-semibold">{t('monthly') || 'Monthly'}</p>
                  <p className="text-lg font-bold text-primary">{formatPrice(MONTHLY_PRICE)}</p>
                  <p className="text-xs text-muted-foreground">/{t('month') || 'month'}</p>
                </button>
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all relative ${
                    selectedPlan === 'annual'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30 hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-success text-success-foreground text-[10px] font-bold rounded-full">
                    -10%
                  </span>
                  <p className="text-sm font-semibold">{t('annual') || 'Annual'}</p>
                  <p className="text-lg font-bold text-primary">{formatPrice(ANNUAL_MONTHLY)}</p>
                  <p className="text-xs text-muted-foreground">/{t('month') || 'month'}</p>
                </button>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    feature.highlight 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-secondary/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    feature.highlight ? 'bg-primary/20' : 'bg-secondary'
                  }`}>
                    <feature.icon className={`w-4 h-4 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm ${feature.highlight ? 'font-semibold' : ''}`}>
                    {feature.text}
                  </span>
                  <Check className={`w-4 h-4 ml-auto ${feature.highlight ? 'text-primary' : 'text-green-500'}`} />
                </motion.div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t('haveCoupon') || 'Have a coupon code?'}</span>
              </div>
              
              {appliedCoupon?.valid ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isVipCoupon() 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isVipCoupon() ? (
                      <Crown className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${isVipCoupon() ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                        {appliedCoupon.code} - {getDiscountLabel()}
                      </p>
                      {appliedCoupon.description && (
                        <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={t('enterCouponCode') || 'Enter coupon code'}
                    className="uppercase"
                    maxLength={20}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={loading || !couponCode.trim()}
                    variant="outline"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t('apply') || 'Apply'
                    )}
                  </Button>
                </div>
              )}
              
              {couponError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-destructive"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">{couponError}</span>
                </motion.div>
              )}
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              {isVipCoupon() ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-xl text-muted-foreground line-through">{formatPrice(MONTHLY_PRICE)}</span>
                    <span className="text-4xl font-bold text-amber-500">{t('free') || 'GRÁTIS'}</span>
                  </div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    🎁 {t('vipCouponApplied') || 'VIP coupon applied! Premium is free.'}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-baseline justify-center gap-2">
                    {(hasDiscount || selectedPlan === 'annual') && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(MONTHLY_PRICE)}
                      </span>
                    )}
                    <span className={`text-4xl font-bold ${hasDiscount ? 'text-green-500' : 'text-primary'}`}>
                      {formatPrice(finalMonthly)}
                    </span>
                    <span className="text-muted-foreground">/{t('month') || 'month'}</span>
                  </div>
                  {selectedPlan === 'annual' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(finalTotal)} /{t('year') || 'year'}
                    </p>
                  )}
                  {hasDiscount && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-green-500 font-medium mt-1"
                    >
                      🎉 {t('youSave') || 'You save'} {formatPrice(basePrice - finalMonthly)}/{t('month') || 'month'}!
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('cancelAnytime') || 'Cancel anytime'}
                  </p>
                </>
              )}
            </div>

            {/* CTA */}
            <Button
              className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl shadow-lg"
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              {subscribing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : isVipCoupon() ? (
                <Gift className="w-5 h-5 mr-2" />
              ) : (
                <Crown className="w-5 h-5 mr-2" />
              )}
              {subscribing 
                ? (t('activating') || 'Activating...')
                : isVipCoupon() 
                  ? (t('redeemVip') || 'Redeem VIP Free')
                  : (t('subscribePremium') || 'Subscribe to Premium')
              }
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {isVipCoupon() 
                ? (t('couponRedemption') || 'Your coupon will be redeemed upon confirmation')
                : (t('securePayment') || 'Secure payment processed by Stripe')
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumModal;
