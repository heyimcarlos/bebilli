import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Sparkles, Zap, Shield, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'group_limit' | 'feature';
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, reason = 'group_limit' }) => {
  const { t, formatCurrency } = useApp();

  const features = [
    { icon: Infinity, text: t('unlimitedGroups') || 'Unlimited groups', highlight: reason === 'group_limit' },
    { icon: Sparkles, text: t('exclusiveBadges') || 'Exclusive badges' },
    { icon: Zap, text: t('prioritySupport') || 'Priority support' },
    { icon: Shield, text: t('advancedAnalytics') || 'Advanced analytics' },
    { icon: Crown, text: t('earlyAccess') || 'Early access to features' },
  ];

  if (!isOpen) return null;

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
          className="relative w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden"
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
                  <Check className={`w-4 h-4 ml-auto ${feature.highlight ? 'text-primary' : 'text-success'}`} />
                </motion.div>
              ))}
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-primary">{formatCurrency(5.90)}</span>
                <span className="text-muted-foreground">/{t('month') || 'month'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('cancelAnytime') || 'Cancel anytime'}
              </p>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              {t('subscribePremium') || 'Subscribe to Premium'}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {t('securePayment') || 'Secure payment processed by Stripe'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumModal;
