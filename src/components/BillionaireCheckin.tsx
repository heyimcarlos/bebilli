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

      {hasCheckedInToday ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between p-2"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-success" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-success">{t('checkinComplete') || 'Checked in ✓'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeLeft}
              </p>
            </div>
          </div>
          <span className="text-lg">🔥</span>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold">
                {targetGroup ? targetGroup.name : (t('checkinNow') || 'Check-in')}
              </p>
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" /> {timeLeft}
              </span>
            </div>
            {!hasCheckedInToday && (
              <p className="text-[11px] text-destructive/80 font-medium">
                ⚠️ {t('streakWarning') || 'Missing today breaks your streak'}
              </p>
            )}
          </div>
          <Button
            onClick={() => onCheckin(targetGroup?.id || '')}
            className="btn-primary text-primary-foreground h-10 px-5"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            {t('checkinNow') || 'Check-in'}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default BillionaireCheckin;
