import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Zap } from 'lucide-react';
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
  groups?: GroupInfo[];
}

const BillionaireCheckin: React.FC<BillionaireCheckinProps> = ({
  hasCheckedInToday,
  onCheckin,
  groups = [],
}) => {
  const { t } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const targetGroup = groups.length > 0 ? groups[dayOfYear % groups.length] : null;

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

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">{t('billionaireCheckin') || 'Billionaire Check-in'}</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">{timeLeft}</span>
        </div>
      </div>

      {hasCheckedInToday ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3 py-1"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-success" />
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-bold text-success">{t('checkinComplete') || 'Checked in ✓'}</p>
            <p className="text-xs text-muted-foreground">{t('keepItUp') || 'Keep it up!'} 🔥</p>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {!hasCheckedInToday && (
              <p className="text-[11px] text-destructive/80 font-medium">
                ⚠️ {t('streakWarning') || 'Missing today breaks your streak'}
              </p>
            )}
          </div>
          <Button
            onClick={() => onCheckin(targetGroup?.id || '')}
            className="h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            {t('makeDeposit') || 'Fazer aporte'}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default BillionaireCheckin;
