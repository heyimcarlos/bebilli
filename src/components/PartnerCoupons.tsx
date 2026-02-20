import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, Star, Percent, ExternalLink, Loader2, Crown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PartnerCouponData {
  id: string;
  code: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  min_level: number;
  min_group_progress: number;
  premium_only: boolean;
  partner: {
    name: string;
    logo_url: string | null;
    website_url: string | null;
    category: string;
  };
}

interface PartnerCouponsProps {
  userLevel: number;
  groupProgress?: number;
  isPremium?: boolean;
}

const PartnerCoupons: React.FC<PartnerCouponsProps> = ({ userLevel, groupProgress = 0, isPremium = false }) => {
  const { t, formatCurrency } = useApp();
  const [coupons, setCoupons] = useState<PartnerCouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<PartnerCouponData | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_coupons')
        .select('id, code, description, discount_percentage, discount_amount, min_level, min_group_progress, premium_only, partner_id')
        .eq('is_active', true)
        .order('min_group_progress', { ascending: true });

      if (error || !data) {
        setLoading(false);
        return;
      }

      const partnerIds = [...new Set(data.map(c => c.partner_id))];
      const { data: partners } = await supabase
        .from('partners')
        .select('id, name, logo_url, website_url, category')
        .in('id', partnerIds);

      const partnerMap = new Map((partners || []).map(p => [p.id, p]));

      const mapped: PartnerCouponData[] = data.map(c => ({
        id: c.id,
        code: c.code,
        description: c.description,
        discount_percentage: c.discount_percentage,
        discount_amount: c.discount_amount,
        min_level: c.min_level,
        min_group_progress: c.min_group_progress,
        premium_only: (c as any).premium_only || false,
        partner: partnerMap.get(c.partner_id) || { name: 'Partner', logo_url: null, website_url: null, category: '' },
      }));

      setCoupons(mapped);
      setLoading(false);
    };

    fetchCoupons();
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isUnlocked = (coupon: PartnerCouponData) => {
    if (coupon.premium_only && !isPremium) return false;
    return groupProgress >= coupon.min_group_progress && userLevel >= coupon.min_level;
  };

  const getLockedReason = (coupon: PartnerCouponData): string => {
    if (coupon.premium_only && !isPremium) return t('premiumOnly') || 'Premium Only';
    if (groupProgress < coupon.min_group_progress) return `${coupon.min_group_progress}%`;
    return `Level ${coupon.min_level}`;
  };

  const milestones = [...new Set(coupons.map(c => c.min_group_progress))].sort((a, b) => a - b);
  const displayMilestones = milestones.length > 0 ? milestones : [25, 50, 75, 100];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{t('noCouponsAvailable') || 'No partner coupons available yet'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t('partners') || 'Partner Rewards'}</h3>
      </div>

      {/* Progress-based unlocks */}
      <div className="glass-card p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-3">{t('unlockByProgress') || 'Unlock by group progress'}</p>
        <div className="relative">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(groupProgress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {displayMilestones.map((milestone) => (
              <div
                key={milestone}
                className={`flex flex-col items-center ${
                  groupProgress >= milestone ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    groupProgress >= milestone
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {groupProgress >= milestone ? '✓' : <Lock className="w-3 h-3" />}
                </div>
                <span className="text-xs mt-1">{milestone}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-3">
        {coupons.map((coupon) => {
          const unlocked = isUnlocked(coupon);
          const discountLabel = coupon.discount_percentage
            ? `${coupon.discount_percentage}%`
            : coupon.discount_amount
            ? formatCurrency(coupon.discount_amount)
            : '';

          return (
            <motion.div
              key={coupon.id}
              className={`glass-card p-4 ${!unlocked ? 'opacity-60' : ''} ${coupon.premium_only ? 'border border-amber-500/30' : ''}`}
              whileHover={unlocked ? { scale: 1.02 } : undefined}
              onClick={() => unlocked && setSelectedCoupon(coupon)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {coupon.partner.logo_url ? (
                    <img
                      src={coupon.partner.logo_url}
                      alt={coupon.partner.name}
                      className={`w-12 h-12 rounded-xl object-contain bg-white p-1 ${!unlocked ? 'grayscale' : ''}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/48?text=${coupon.partner.name[0]}`;
                      }}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold ${!unlocked ? 'grayscale' : ''}`}>
                      {coupon.partner.name[0]}
                    </div>
                  )}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      {coupon.premium_only && !isPremium ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">{coupon.partner.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {discountLabel}
                    </span>
                    {coupon.premium_only && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{coupon.description}</p>
                </div>

                {unlocked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(coupon.code);
                    }}
                  >
                    {copiedCode === coupon.code ? '✓' : <Percent className="w-4 h-4" />}
                  </Button>
                ) : (
                  <div className="text-xs text-muted-foreground text-center">
                    {coupon.premium_only && !isPremium ? (
                      <Crown className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                    ) : (
                      <Lock className="w-4 h-4 mx-auto mb-1" />
                    )}
                    {getLockedReason(coupon)}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Coupon Detail Modal */}
      <AnimatePresence>
        {selectedCoupon && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCoupon(null)}
          >
            <motion.div
              className="w-full max-w-sm bg-card rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {selectedCoupon.premium_only && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-3">
                    <Crown className="w-3 h-3" /> {t('exclusivePremium') || 'VIP Exclusive'}
                  </div>
                )}
                {selectedCoupon.partner.logo_url ? (
                  <img
                    src={selectedCoupon.partner.logo_url}
                    alt={selectedCoupon.partner.name}
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 object-contain bg-white p-2"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-4 bg-primary/20 flex items-center justify-center text-2xl font-bold">
                    {selectedCoupon.partner.name[0]}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{selectedCoupon.partner.name}</h3>
                <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/20 text-primary font-bold text-lg mb-4">
                  <Star className="w-5 h-5" />
                  {selectedCoupon.discount_percentage
                    ? `${selectedCoupon.discount_percentage}% OFF`
                    : `${formatCurrency(selectedCoupon.discount_amount || 0)} OFF`}
                </div>
                <p className="text-muted-foreground mb-6">{selectedCoupon.description}</p>

                <div className="bg-secondary rounded-xl p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">{t('couponCode') || 'Coupon Code'}</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">{selectedCoupon.code}</p>
                </div>

                <Button
                  className="w-full btn-primary text-primary-foreground mb-2"
                  onClick={() => handleCopyCode(selectedCoupon.code)}
                >
                  {copiedCode === selectedCoupon.code ? '✓ Copied!' : t('copyCode') || 'Copy Code'}
                </Button>

                {selectedCoupon.partner.website_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedCoupon.partner.website_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('visitPartner') || 'Visit Partner'}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerCoupons;
