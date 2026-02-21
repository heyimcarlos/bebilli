import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Swords } from 'lucide-react';
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
      {/* Background */}
      <div className={`absolute inset-0 ${hasCheckedInToday 
        ? 'bg-gradient-to-br from-success/8 via-card to-success/5' 
        : 'bg-gradient-to-br from-primary/8 via-card to-accent/5'
      }`} />
      
      {/* Animated border glow for uncompleted */}
      {!hasCheckedInToday && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2 border-primary/30 pointer-events-none"
        />
      )}

      <div className="relative p-4">
        {/* Quest header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              hasCheckedInToday 
                ? 'bg-success/20' 
                : 'bg-gradient-to-br from-primary to-accent'
            }`}
            animate={!hasCheckedInToday ? { 
              scale: [1, 1.05, 1],
            } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {hasCheckedInToday ? (
              <Check className="w-5 h-5 text-success" strokeWidth={3} />
            ) : (
              <Swords className="w-5 h-5 text-primary-foreground" />
            )}
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {t('dailyMission') || 'MISSÃO DIÁRIA'}
              </span>
              {hasCheckedInToday && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[9px] font-bold uppercase tracking-wider text-success bg-success/15 px-1.5 py-0.5 rounded"
                >
                  ✓ {t('complete') || 'COMPLETA'}
                </motion.span>
              )}
            </div>
            <p className="text-sm font-bold text-foreground">
              {t('billionaireCheckin') || 'Billionaire Check-in'}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-[3px] font-mono">
            {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((val, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground/40 text-[10px]">:</span>}
                <span className="text-[11px] font-bold text-muted-foreground bg-secondary px-1.5 py-1 rounded tabular-nums">
                  {val}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action */}
        {hasCheckedInToday ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-success/8 border border-success/20"
          >
            <span className="text-base">🔥</span>
            <p className="text-xs font-semibold text-success">
              {t('checkinComplete') || 'Missão concluída! Volte amanhã.'}
            </p>
          </motion.div>
        ) : (
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => onCheckin(targetGroup?.id || '')}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:brightness-110 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 text-sm tracking-wide transition-all"
            >
              <Swords className="w-4 h-4 mr-2" />
              {t('contributeNow') || 'Contribuir agora'}
              <span className="ml-2 text-primary-foreground/70">→</span>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BillionaireCheckin;
