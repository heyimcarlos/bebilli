import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, Gift, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface DailyChallengeProps {
  hasContributedToday: boolean;
  onContribute: () => void;
  totalGoal?: number; // Sum of all user's group goals
  userName?: string;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ 
  hasContributedToday,
  onContribute,
  totalGoal = 0,
  userName = ''
}) => {
  const { formatCurrency, t } = useApp();
  const [timeLeft, setTimeLeft] = useState('');
  const [todayChallenge, setTodayChallenge] = useState<{
    title: string;
    amount: number;
    reward: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    // Calculate dynamic challenge based on user's goals
    const generateDynamicChallenge = () => {
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
      );
      
      // Base challenge on 0.05% to 0.1% of total goal (minimum $1, maximum $100)
      // Using average of 0.075% (0.00075) as base rate
      const baseAmount = totalGoal > 0 ? Math.max(1, Math.min(100, totalGoal * 0.00075)) : 5;
      
      // Variation factors based on day
      const variations = [
        { multiplier: 1.0, type: 'standard' },
        { multiplier: 0.5, type: 'easy' },
        { multiplier: 1.5, type: 'ambitious' },
        { multiplier: 0.75, type: 'balanced' },
        { multiplier: 2.0, type: 'challenge' },
        { multiplier: 0.25, type: 'micro' },
        { multiplier: 1.25, type: 'growth' },
      ];
      
      const variationIndex = dayOfYear % variations.length;
      const variation = variations[variationIndex];
      const finalAmount = Math.round(baseAmount * variation.multiplier * 100) / 100;
      
      // Dynamic challenge titles based on type
      const challengeTemplates = {
        standard: {
          title: t('dailySaveChallenge') || `Save ${formatCurrency(finalAmount)} today`,
          description: t('standardChallengeDesc') || 'A balanced step towards your dreams',
          reward: '⭐ 10 XP'
        },
        easy: {
          title: t('easyDayChallenge') || `Quick save: ${formatCurrency(finalAmount)}`,
          description: t('easyChallengeDesc') || 'Small steps lead to big achievements',
          reward: '💫 5 XP'
        },
        ambitious: {
          title: t('ambitiousChallenge') || `Big push: ${formatCurrency(finalAmount)}`,
          description: t('ambitiousChallengeDesc') || 'Challenge yourself to reach higher',
          reward: '🚀 15 XP'
        },
        balanced: {
          title: t('balancedChallenge') || `Steady save: ${formatCurrency(finalAmount)}`,
          description: t('balancedChallengeDesc') || 'Consistency is the key to success',
          reward: '🌟 8 XP'
        },
        challenge: {
          title: t('doubleChallenge') || `Power day: ${formatCurrency(finalAmount)}`,
          description: t('doubleChallengeDesc') || 'Push your limits today!',
          reward: '🔥 20 XP + Streak Bonus'
        },
        micro: {
          title: t('microChallenge') || `Micro save: ${formatCurrency(finalAmount)}`,
          description: t('microChallengeDesc') || 'Every cent counts on your journey',
          reward: '✨ 3 XP'
        },
        growth: {
          title: t('growthChallenge') || `Growth step: ${formatCurrency(finalAmount)}`,
          description: t('growthChallengeDesc') || 'Invest in your future self',
          reward: '📈 12 XP'
        }
      };
      
      const template = challengeTemplates[variation.type as keyof typeof challengeTemplates];
      
      setTodayChallenge({
        title: totalGoal > 0 
          ? `${t('save') || 'Save'} ${formatCurrency(finalAmount)} ${t('today') || 'today'}`
          : template.title,
        amount: finalAmount,
        reward: template.reward,
        description: template.description
      });
    };

    generateDynamicChallenge();

    // Update countdown
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [totalGoal, formatCurrency, t]);

  if (!todayChallenge) return null;

  // Calculate progress percentage towards today's challenge
  const progressPercentage = totalGoal > 0 
    ? Math.min(100, (todayChallenge.amount / totalGoal) * 100 * 200) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-4 relative overflow-hidden"
    >
      {/* Shimmer effect */}
      {!hasContributedToday && (
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
        />
      )}

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground">{t('dailyChallenge')}</p>
              {totalGoal > 0 && (
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              )}
            </div>
            <p className="font-semibold text-foreground text-sm">{todayChallenge.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Progress indicator for personalized challenges */}
      {totalGoal > 0 && !hasContributedToday && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">{todayChallenge.description}</p>
          <div className="text-xs text-muted-foreground">
            <span className="text-primary font-medium">0.05-0.1%</span> {t('ofYourGoal') || 'of your total goal'}
          </div>
        </div>
      )}

      {hasContributedToday ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between p-3 rounded-xl bg-success/20 border border-success/30"
        >
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Check className="w-5 h-5 text-success" />
            </motion.div>
            <span className="text-success font-medium text-sm">{t('challengeComplete')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4 text-success" />
            <span className="text-success text-sm">{todayChallenge.reward}</span>
          </div>
        </motion.div>
      ) : (
        <Button
          onClick={onContribute}
          className="w-full btn-primary text-primary-foreground"
          size="sm"
        >
          <Gift className="w-4 h-4 mr-2" />
          {t('completeChallenge')} • {todayChallenge.reward}
        </Button>
      )}
    </motion.div>
  );
};

export default DailyChallenge;
