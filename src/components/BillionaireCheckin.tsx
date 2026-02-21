import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface GroupInfo {
  id: string;
  name: string;
  goal_amount: number;
}

interface BillionaireCheckinProps {
  hasCheckedInToday: boolean;
  onCheckin: (groupId: string) => void;
  totalGoal?: number;
  userName?: string;
  groups?: GroupInfo[];
}

const BillionaireCheckin: React.FC<BillionaireCheckinProps> = ({
  hasCheckedInToday,
  onCheckin,
  totalGoal = 0,
  userName = '',
  groups = [],
}) => {
  const { formatCurrency, t } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  // Pick today's target group
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const targetGroup = groups.length > 0 ? groups[dayOfYear % groups.length] : null;

  // Suggest 0.05% to 0.1% of goal
  const suggestedMin = totalGoal > 0 ? Math.max(0.01, totalGoal * 0.0005) : 1;
  const suggestedMax = totalGoal > 0 ? Math.max(0.01, totalGoal * 0.001) : 5;

  useEffect(() => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-4 relative overflow-hidden"
    >
      {/* Shimmer */}
      {!hasCheckedInToday && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
        />
      )}

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                {t('billionaireCheckin') || 'Billionaire Check-in'}
              </p>
              {totalGoal > 0 && (
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              )}
            </div>
            <p className="text-foreground text-sm font-medium">
              {targetGroup
                ? `${t('checkinFor') || 'Check-in for'} ${targetGroup.name}`
                : (t('dailyCheckinDesc') || 'Register your discipline today')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Suggestion */}
      {totalGoal > 0 && !hasCheckedInToday && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            {t('suggestedAmount') || 'Suggested'}: {formatCurrency(suggestedMin)} – {formatCurrency(suggestedMax)}
          </p>
          <p className="text-xs text-muted-foreground/70 italic">
            {t('anyAmountCounts') || 'Any amount counts. Even cents. Or log an offline save.'}
          </p>
        </div>
      )}

      {/* Streak warning */}
      {!hasCheckedInToday && (
        <p className="text-xs text-destructive/80 mb-3 font-medium">
          ⚠️ {t('streakWarning') || 'Missing a day breaks your streak and impacts your ranking.'}
        </p>
      )}

      {hasCheckedInToday ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between p-3 rounded-xl bg-success/20 border border-success/30"
        >
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <Check className="w-5 h-5 text-success" />
            </motion.div>
            <span className="text-success font-medium text-sm">
              {t('checkinComplete') || 'Checked in today ✓'}
            </span>
          </div>
          <span className="text-success text-sm">🔥 Streak safe</span>
        </motion.div>
      ) : (
        <Button
          onClick={() => onCheckin(targetGroup?.id || '')}
          className="w-full btn-primary text-primary-foreground"
          size="sm"
        >
          <Zap className="w-4 h-4 mr-2" />
          {t('checkinNow') || 'Check-in now'}
        </Button>
      )}
    </motion.div>
  );
};

export default BillionaireCheckin;
