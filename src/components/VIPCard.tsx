import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Star, Zap, Shield, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PremiumModal from '@/components/PremiumModal';

interface VIPCardProps {
  onClick?: () => void;
}

const VIPCard: React.FC<VIPCardProps> = ({ onClick }) => {
  const { t, formatCurrency } = useApp();
  const { user, profile, groups } = useAuthContext();
  const { isPremium, groupCount } = usePremiumCheck(user?.id);
  const [showPanel, setShowPanel] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Calculate personalized stats
  const totalSaved = groups.reduce((sum, g) => sum + g.current_amount, 0);
  const totalGoal = groups.reduce((sum, g) => sum + g.goal_amount, 0);
  const overallProgress = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

  const premiumBenefits = [
    { icon: Zap, label: t('unlimitedGroups') || 'Unlimited Groups', description: t('unlimitedGroupsDesc') || 'Create and join as many groups as you want' },
    { icon: Star, label: t('prioritySupport') || 'Priority Support', description: t('prioritySupportDesc') || '24/7 dedicated support channel' },
    { icon: Shield, label: t('advancedAnalytics') || 'Advanced Analytics', description: t('advancedAnalyticsDesc') || 'Detailed insights and reports' },
    { icon: Gift, label: t('exclusiveCoupons') || 'Exclusive Coupons', description: t('exclusiveCouponsDesc') || 'Access to VIP-only partner deals' },
    { icon: TrendingUp, label: t('earlyFeatures') || 'Early Features', description: t('earlyFeaturesDesc') || 'Be the first to try new features' },
  ];

  if (!isPremium) {
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
        <PremiumModal 
          isOpen={showPremiumModal} 
          onClose={() => setShowPremiumModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(true)}
        className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-lg flex items-center justify-center text-white hover:shadow-amber-500/40 hover:shadow-xl transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={t('vipArea') || 'VIP Area'}
      >
        <Crown className="w-5 h-5" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowPanel(false)}
            />

            {/* VIP Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-20 right-4 w-80 max-w-[90vw] z-50"
            >
              <Card className="overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-950/10">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-4 text-white">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                          VIP Member
                          <Sparkles className="w-4 h-4" />
                        </h2>
                        <p className="text-xs opacity-90">{profile?.name}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowPanel(false)}
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Personalized Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20"
                    >
                      <p className="text-xs text-muted-foreground">{t('totalSaved') || 'Total Saved'}</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(totalSaved)}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20"
                    >
                      <p className="text-xs text-muted-foreground">{t('activeGroups') || 'Active Groups'}</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {groupCount}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20"
                    >
                      <p className="text-xs text-muted-foreground">{t('level') || 'Level'}</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {profile?.level || 1}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20"
                    >
                      <p className="text-xs text-muted-foreground">{t('streak') || 'Streak'}</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        🔥 {profile?.current_streak || 0}
                      </p>
                    </motion.div>
                  </div>

                  {/* Overall Progress */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('overallProgress') || 'Overall Progress'}</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{overallProgress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                        transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* VIP Benefits */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {t('yourBenefits') || 'Your Benefits'}
                    </h3>
                    <div className="space-y-2">
                      {premiumBenefits.map((benefit, index) => (
                        <motion.div
                          key={benefit.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                            <benefit.icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{benefit.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{benefit.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* VIP Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-xl border border-amber-500/20"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {t('premiumMember') || 'Premium Member'}
                        </span>
                        <Crown className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('thankYouPremium') || 'Thank you for supporting Billi!'}
                      </p>
                    </div>
                  </motion.div>
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
