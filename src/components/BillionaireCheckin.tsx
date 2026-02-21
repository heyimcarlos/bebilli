import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Rocket } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

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
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden mb-4"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent" />
      
      {/* Shimmer effect when not checked in */}
      {!hasCheckedInToday && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent skew-x-12 pointer-events-none"
        />
      )}

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide">
              {t('billionaireCheckin') || 'Billionaire Check-in'}
            </span>
          </div>
          
          {hasCheckedInToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </div>

        {/* Countdown timer - always visible */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex items-center gap-1">
            {[
              { value: pad(timeLeft.hours), label: 'h' },
              { value: pad(timeLeft.minutes), label: 'm' },
              { value: pad(timeLeft.seconds), label: 's' },
            ].map((unit, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground/50 text-xs font-mono">:</span>}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-mono font-bold text-foreground tabular-nums">
                    {unit.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{unit.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action area */}
        {hasCheckedInToday ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <span className="text-lg">🔥</span>
            <p className="text-sm font-semibold text-emerald-500">
              {t('checkinComplete') || 'Check-in feito!'} 
            </p>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => onCheckin(targetGroup?.id || '')}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 text-sm tracking-wide"
            >
              <Rocket className="w-4 h-4 mr-2" />
              {t('contributeNow') || 'Contribuir agora'} 🚀
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BillionaireCheckin;
