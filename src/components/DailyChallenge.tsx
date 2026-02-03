import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface DailyChallengeProps {
  hasContributedToday: boolean;
  onContribute: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ 
  hasContributedToday,
  onContribute 
}) => {
  const { formatCurrency, t } = useApp();
  const [timeLeft, setTimeLeft] = useState('');
  const [todayChallengeIndex, setTodayChallengeIndex] = useState(0);

  // Challenge definitions using translation keys
  const getChallenges = () => [
    { id: 1, titleKey: 'save5Today', amount: 5, reward: '🌟 5 XP' },
    { id: 2, titleKey: 'save10Today', amount: 10, reward: '⭐ 10 XP' },
    { id: 3, titleKey: 'makeAnyContribution', amount: 1, reward: '💫 2 XP' },
    { id: 4, titleKey: 'save20Today', amount: 20, reward: '🚀 20 XP' },
    { id: 5, titleKey: 'keepStreakAlive', amount: 1, reward: '🔥 Streak Bonus' },
  ];

  const challenges = getChallenges();

  useEffect(() => {
    // Get consistent daily challenge based on date
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    setTodayChallengeIndex(dayOfYear % challenges.length);

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
  }, []);

  const todayChallenge = challenges[todayChallengeIndex];

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
            <p className="text-xs text-muted-foreground">{t('dailyChallenge')}</p>
            <p className="font-semibold text-foreground text-sm">{t(todayChallenge.titleKey)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeLeft}</span>
        </div>
      </div>

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
