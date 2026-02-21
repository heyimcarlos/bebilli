import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Star, Zap, Shield, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { Card, CardContent } from '@/components/ui/card';
import PremiumModal from '@/components/PremiumModal';
import PremiumAnalytics from '@/components/PremiumAnalytics';

interface VIPCardProps {
  onClick?: () => void;
}

const VIPCard: React.FC<VIPCardProps> = ({ onClick }) => {
  const { t, formatCurrency } = useApp();
  const { user, profile, groups } = useAuthContext();
  const { isPremium, groupCount } = usePremiumCheck(user?.id);
  const [showPanel, setShowPanel] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics'>('overview');

  const totalSaved = groups.reduce((sum, g) => sum + g.current_amount, 0);
  const totalGoal = groups.reduce((sum, g) => sum + g.goal_amount, 0);
  const overallProgress = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

  const premiumBenefits = [
    { icon: Zap, label: t('unlimitedGroups') || 'Unlimited Groups' },
    { icon: Star, label: t('prioritySupport') || 'Priority Support' },
    { icon: Shield, label: t('advancedAnalytics') || 'Advanced Analytics' },
    { icon: Gift, label: t('exclusiveCoupons') || 'Exclusive Coupons' },
    { icon: TrendingUp, label: t('earlyFeatures') || 'Early Features' },
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
        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowPanel(false)}
            />
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
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                          VIP <Sparkles className="w-4 h-4" />
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

                {/* Tab toggle */}
                <div className="flex gap-1 bg-secondary/50 p-1 mx-4 mt-3 rounded-lg">
                  <button
                    onClick={() => setActiveSection('overview')}
                    className={`flex-1 text-xs py-2 rounded-md font-semibold transition-colors ${activeSection === 'overview' ? 'bg-amber-500 text-white' : 'text-muted-foreground'}`}
                  >
                    {t('overview') || 'Overview'}
                  </button>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className={`flex-1 text-xs py-2 rounded-md font-semibold transition-colors ${activeSection === 'analytics' ? 'bg-amber-500 text-white' : 'text-muted-foreground'}`}
                  >
                    {t('advancedAnalytics') || 'Analytics'}
                  </button>
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

                      {/* Benefits */}
                      <div className="space-y-1.5">
                        {premiumBenefits.map((b, i) => (
                          <motion.div key={b.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <b.icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-sm font-medium">{b.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </>
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
