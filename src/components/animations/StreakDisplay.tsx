import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Star, Trophy, Target } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  showDetails?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  bestStreak,
  showDetails = true,
}) => {
  const { t } = useApp();

  const getStreakLevel = () => {
    if (currentStreak >= 30) return { level: 'legendary', color: 'text-amber-400', bg: 'from-amber-500/30 to-orange-600/30', icon: Trophy };
    if (currentStreak >= 14) return { level: 'epic', color: 'text-purple-400', bg: 'from-purple-500/30 to-pink-600/30', icon: Star };
    if (currentStreak >= 7) return { level: 'rare', color: 'text-blue-400', bg: 'from-blue-500/30 to-cyan-600/30', icon: Zap };
    if (currentStreak >= 3) return { level: 'common', color: 'text-green-400', bg: 'from-green-500/30 to-emerald-600/30', icon: Target };
    return { level: 'starter', color: 'text-muted-foreground', bg: 'from-muted/30 to-muted/10', icon: Flame };
  };

  const streakInfo = getStreakLevel();
  const StreakIcon = streakInfo.icon;
  const isOnFire = currentStreak >= 7;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-4 bg-gradient-to-br ${streakInfo.bg} relative overflow-hidden`}
    >
      {/* Background flames for high streaks */}
      {isOnFire && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <div className="absolute bottom-0 left-1/4 w-20 h-32 bg-gradient-to-t from-orange-500/30 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 right-1/4 w-16 h-24 bg-gradient-to-t from-red-500/30 to-transparent rounded-full blur-xl" />
        </motion.div>
      )}

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${streakInfo.bg} flex items-center justify-center`}
            animate={isOnFire ? {
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
            } : undefined}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <StreakIcon className={`w-6 h-6 ${streakInfo.color}`} />
          </motion.div>
          
          <div>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={currentStreak}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-3xl font-black ${streakInfo.color}`}
              >
                {currentStreak}
              </motion.span>
              <span className="text-sm text-muted-foreground">
                {currentStreak === 1 ? t('day') || 'day' : t('days') || 'days'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('currentStreak') || 'Current Streak'}
            </p>
          </div>
        </div>

        {/* Fire animation for active streaks */}
        {currentStreak > 0 && (
          <motion.div className="flex">
            {[...Array(Math.min(currentStreak, 5))].map((_, i) => (
              <motion.span
                key={i}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-2xl -ml-1"
                style={{
                  filter: `hue-rotate(${i * 10}deg)`,
                }}
              >
                🔥
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-border/50"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('bestStreak') || 'Best Streak'}
            </span>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{bestStreak} {t('days') || 'days'}</span>
            </div>
          </div>
          
          {currentStreak > 0 && currentStreak === bestStreak && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center"
            >
              <span className="text-xs text-amber-400 font-semibold">
                🎉 {t('personalBest') || "You're at your personal best!"}
              </span>
            </motion.div>
          )}

          {/* Progress to next streak level */}
          {currentStreak < 30 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{t('nextLevel') || 'Next level'}</span>
                <span>
                  {currentStreak < 3 ? '3' : currentStreak < 7 ? '7' : currentStreak < 14 ? '14' : '30'} {t('days') || 'days'}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      currentStreak < 3
                        ? (currentStreak / 3) * 100
                        : currentStreak < 7
                        ? (currentStreak / 7) * 100
                        : currentStreak < 14
                        ? (currentStreak / 14) * 100
                        : (currentStreak / 30) * 100
                    }%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${streakInfo.bg.replace('/30', '/70')}`}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakDisplay;
