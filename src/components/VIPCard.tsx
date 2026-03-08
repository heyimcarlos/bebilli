import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Star, Zap, Shield, Gift, TrendingUp, Sparkles, CreditCard, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { Card, CardContent } from '@/components/ui/card';
import PremiumModal from '@/components/PremiumModal';
import PremiumAnalytics from '@/components/PremiumAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VIPCardProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface SubscriptionInfo {
  id: string;
  plan_type: string;
  amount: number;
  currency: string;
  status: string;
  subscribed_at: string;
  renewal_date: string | null;
  payment_method: string;
}

const VIPCard: React.FC<VIPCardProps> = ({ onClick, isOpen: externalOpen, onClose: externalClose }) => {
  const { t, formatCurrency } = useApp();
  const { user, profile, groups } = useAuthContext();
  const { isPremium, groupCount } = usePremiumCheck(user?.id);
  const [internalOpen, setInternalOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics' | 'subscription'>('overview');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [cancelledSub, setCancelledSub] = useState<SubscriptionInfo | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      // Fetch active subscription
      const { data: activeSub } = await supabase
        .from('user_subscriptions')
        .select('id, plan_type, amount, currency, status, subscribed_at, renewal_date, payment_method')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (activeSub) {
        setSubscription(activeSub as SubscriptionInfo);
        return;
      }
      // Fetch cancelled subscription for reactivation
      const { data: cancelled } = await supabase
        .from('user_subscriptions')
        .select('id, plan_type, amount, currency, status, subscribed_at, renewal_date, payment_method')
        .eq('user_id', user.id)
        .eq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) setCancelledSub(cancelled as SubscriptionInfo);
    };
    fetchSub();
  }, [user]);

  const showPanel = externalOpen !== undefined ? externalOpen : internalOpen;
  const closePanel = () => {
    if (externalClose) externalClose();
    else setInternalOpen(false);
  };

  const totalSaved = groups.reduce((sum, g) => sum + g.current_amount, 0);
  const totalGoal = groups.reduce((sum, g) => sum + g.goal_amount, 0);
  const overallProgress = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

  const activeBenefits = [
    { icon: Zap, label: t('unlimitedGroups') || 'Unlimited Groups', active: true },
    { icon: Star, label: t('prioritySupport') || 'Priority Support', active: true },
    { icon: Shield, label: t('advancedAnalytics') || 'Advanced Analytics', active: true },
    { icon: Gift, label: t('exclusiveCoupons') || 'Exclusive Coupons', active: true },
    { icon: TrendingUp, label: t('earlyFeatures') || 'Early Features', active: true },
  ];

  const isExternallyControlled = externalClose !== undefined;

  if (!isPremium && !isExternallyControlled) {
    return (
      <>
        <motion.button
          onClick={() => setShowPremiumModal(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg flex items-center justify-center text-white hover:shadow-amber-500/30 hover:shadow-xl transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={t('getPremium') || 'Get Premium'}
        >
          <Crown className="w-5 h-5" />
        </motion.button>
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      </>
    );
  }

  if (!isPremium) return null;

  return (
    <>
      {!isExternallyControlled && (
        <motion.button
          onClick={() => setInternalOpen(true)}
          className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-lg flex items-center justify-center text-white hover:shadow-amber-500/40 hover:shadow-xl transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Crown className="w-5 h-5" />
          <motion.div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        </motion.button>
      )}

      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={closePanel} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-16 left-4 right-4 max-w-lg mx-auto z-50 max-h-[80vh] overflow-y-auto"
            >
              <Card className="overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-950/10">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-4 text-white">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">VIP <Sparkles className="w-4 h-4" /></h2>
                        <p className="text-xs opacity-90">{profile?.name}</p>
                      </div>
                    </div>
                    <motion.button onClick={closePanel} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-secondary/50 p-1 mx-4 mt-3 rounded-lg">
                  {(['overview', 'subscription', 'analytics'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveSection(tab)}
                      className={`flex-1 text-xs py-2 rounded-md font-semibold transition-colors ${activeSection === tab ? 'bg-amber-500 text-white' : 'text-muted-foreground'}`}>
                      {tab === 'overview' ? (t('overview') || 'Overview') : tab === 'subscription' ? (t('myPlan') || 'My Plan') : (t('advancedAnalytics') || 'Analytics')}
                    </button>
                  ))}
                </div>

                <CardContent className="p-4 space-y-4">
                  {activeSection === 'overview' ? (
                    <>
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: t('totalSaved') || 'Total Saved', value: formatCurrency(totalSaved) },
                          { label: t('activeGroups') || 'Groups', value: groupCount },
                          { label: t('level') || 'Level', value: profile?.level || 1 },
                          { label: t('streak') || 'Streak', value: `🔥 ${profile?.current_streak || 0}` },
                        ].map((stat, i) => (
                          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20">
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stat.value}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('overallProgress') || 'Overall Progress'}</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{overallProgress.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(overallProgress, 100)}%` }} transition={{ delay: 0.4, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                        </div>
                      </div>

                      {/* Active Benefits */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('activeBenefits') || 'Active Benefits'}</p>
                        {activeBenefits.map((b, i) => (
                          <motion.div key={b.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <b.icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-sm font-medium flex-1">{b.label}</p>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : activeSection === 'subscription' ? (
                    <div className="space-y-4">
                      {subscription ? (
                        <>
                          {/* Plan Card */}
                          <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/15 rounded-xl p-4 border border-amber-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Crown className="w-5 h-5 text-amber-500" />
                              <h3 className="font-bold text-lg">Billi Premium</h3>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CreditCard className="w-4 h-4" />
                                  <span>{t('planType') || 'Plan'}</span>
                                </div>
                                <span className="font-semibold text-sm capitalize">{subscription.plan_type === 'annual' ? (t('annual') || 'Annual') : (t('monthly') || 'Monthly')}</span>
                              </div>
                              <div className="h-px bg-border" />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>💰</span>
                                  <span>{t('amount') || 'Amount'}</span>
                                </div>
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  {formatCurrency(subscription.amount)}/{subscription.plan_type === 'annual' ? (t('year') || 'yr') : (t('month') || 'mo')}
                                </span>
                              </div>
                              <div className="h-px bg-border" />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>{t('memberSince') || 'Member since'}</span>
                                </div>
                                <span className="text-sm font-medium">{new Date(subscription.subscribed_at).toLocaleDateString()}</span>
                              </div>
                              {subscription.renewal_date && (
                                <>
                                  <div className="h-px bg-border" />
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="w-4 h-4" />
                                      <span>{t('nextRenewal') || 'Next renewal'}</span>
                                    </div>
                                    <span className="text-sm font-medium">{new Date(subscription.renewal_date).toLocaleDateString()}</span>
                                  </div>
                                </>
                              )}
                              <div className="h-px bg-border" />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>💳</span>
                                  <span>{t('paymentMethod') || 'Payment'}</span>
                                </div>
                                <span className="text-sm font-medium capitalize">{subscription.payment_method}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t('subscriptionActive') || 'Subscription active'}</span>
                          </div>

                          {/* Cancel Button */}
                          {!showCancelConfirm ? (
                            <motion.button
                              onClick={() => setShowCancelConfirm(true)}
                              className="w-full py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                              whileTap={{ scale: 0.98 }}
                            >
                              {t('cancelSubscription') || 'Cancel Subscription'}
                            </motion.button>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3"
                            >
                              <div className="flex items-start gap-2">
                                <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-destructive">{t('confirmCancel') || 'Confirm cancellation?'}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {t('cancelWarning') || 'You will lose access to all VIP benefits. This action cannot be undone.'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => setShowCancelConfirm(false)}
                                  className="flex-1 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
                                  whileTap={{ scale: 0.97 }}
                                  disabled={cancelling}
                                >
                                  {t('keepSubscription') || 'Keep VIP'}
                                </motion.button>
                                <motion.button
                                  onClick={async () => {
                                    if (!subscription || !user) return;
                                    setCancelling(true);
                                    try {
                                      const now = new Date().toISOString();
                                      const { error: subError } = await supabase
                                        .from('user_subscriptions')
                                        .update({ status: 'cancelled', cancelled_at: now })
                                        .eq('id', subscription.id);
                                      if (subError) throw subError;

                                      const { error: profileError } = await supabase
                                        .from('profiles')
                                        .update({ is_premium: false })
                                        .eq('id', user.id);
                                      if (profileError) throw profileError;

                                      setSubscription(null);
                                      setShowCancelConfirm(false);
                                      toast.success(t('subscriptionCancelled') || 'Subscription cancelled successfully');
                                      setTimeout(() => window.location.reload(), 1500);
                                    } catch (err) {
                                      console.error('Cancel error:', err);
                                      toast.error(t('cancelError') || 'Failed to cancel subscription');
                                    } finally {
                                      setCancelling(false);
                                    }
                                  }}
                                  className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                                  whileTap={{ scale: 0.97 }}
                                  disabled={cancelling}
                                >
                                  {cancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  {t('confirmCancelBtn') || 'Yes, cancel'}
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </>
                      ) : cancelledSub ? (
                        /* Reactivation Banner */
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 p-5">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                            />
                            <div className="relative space-y-3">
                              <div className="flex items-center gap-2">
                                <Crown className="w-6 h-6 text-amber-500" />
                                <h3 className="font-bold text-lg">{t('weWantYouBack') || 'We want you back!'}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('reactivateDesc') || 'Reactivate your VIP subscription and regain access to all premium benefits instantly.'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{t('previousPlan') || 'Previous plan'}: <span className="font-semibold capitalize">{cancelledSub.plan_type}</span> — {formatCurrency(cancelledSub.amount)}/{cancelledSub.plan_type === 'annual' ? (t('year') || 'yr') : (t('month') || 'mo')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Benefits reminder */}
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('whatYouMiss') || "What you're missing"}</p>
                            {[
                              { icon: Zap, label: t('unlimitedGroups') || 'Unlimited Groups' },
                              { icon: Shield, label: t('advancedAnalytics') || 'Advanced Analytics' },
                              { icon: Gift, label: t('exclusiveCoupons') || 'Exclusive Coupons' },
                            ].map((b, i) => (
                              <motion.div
                                key={b.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                              >
                                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                                  <b.icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="text-sm font-medium flex-1">{b.label}</p>
                                <XCircle className="w-4 h-4 text-muted-foreground/40" />
                              </motion.div>
                            ))}
                          </div>

                          <motion.button
                            onClick={async () => {
                              if (!cancelledSub || !user) return;
                              setReactivating(true);
                              try {
                                const now = new Date().toISOString();
                                const renewalDate = new Date();
                                renewalDate.setMonth(renewalDate.getMonth() + (cancelledSub.plan_type === 'annual' ? 12 : 1));

                                const { error: subError } = await supabase
                                  .from('user_subscriptions')
                                  .update({
                                    status: 'active',
                                    cancelled_at: null,
                                    subscribed_at: now,
                                    renewal_date: renewalDate.toISOString(),
                                    payment_date: now,
                                  })
                                  .eq('id', cancelledSub.id);
                                if (subError) throw subError;

                                const { error: profileError } = await supabase
                                  .from('profiles')
                                  .update({ is_premium: true })
                                  .eq('id', user.id);
                                if (profileError) throw profileError;

                                setSubscription({ ...cancelledSub, status: 'active', subscribed_at: now, renewal_date: renewalDate.toISOString() });
                                setCancelledSub(null);
                                toast.success(t('subscriptionReactivated') || 'Welcome back! VIP reactivated 🎉');
                                setTimeout(() => window.location.reload(), 1500);
                              } catch (err) {
                                console.error('Reactivation error:', err);
                                toast.error(t('reactivateError') || 'Failed to reactivate subscription');
                              } finally {
                                setReactivating(false);
                              }
                            }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={reactivating}
                          >
                            {reactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                            {reactivating ? (t('reactivating') || 'Reactivating...') : (t('reactivateVIP') || 'Reactivate VIP')}
                          </motion.button>
                        </motion.div>
                      ) : (
                        <div className="text-center py-6">
                          <Crown className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                          <p className="text-sm text-muted-foreground">{t('vipViaCoupon') || 'VIP activated via coupon or admin'}</p>
                        </div>
                      )}

                      {/* Insights */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('vipInsights') || 'VIP Insights'}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-secondary/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-black text-primary">{groupCount}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{t('unlimitedGroups') || 'Groups'}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-black text-amber-500">{profile?.total_contributions || 0}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{t('totalDeposits') || 'Deposits'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <PremiumAnalytics />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default VIPCard;
