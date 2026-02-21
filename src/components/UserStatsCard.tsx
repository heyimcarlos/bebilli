import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

interface UserStatsCardProps {
  currentStreak: number;
  bestStreak: number;
  totalContributions: number;
  level: number;
  maxSaved: number;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({
  currentStreak,
  bestStreak,
  totalContributions,
  level,
  maxSaved,
}) => {
  const { formatCurrency, t } = useApp();

  // XP system: contributions = XP, level thresholds grow exponentially
  const getXPForLevel = (lvl: number) => Math.floor(Math.pow(lvl, 1.8) * 5);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpProgress = Math.min(((totalContributions - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
  const xpNeeded = Math.max(nextLevelXP - totalContributions, 0);

  const getRankInfo = (lvl: number) => {
    if (lvl >= 10) return { title: t('billionaireLegend'), emoji: '👑', ring: 'from-amber-400 via-yellow-300 to-amber-500' };
    if (lvl >= 8) return { title: t('moneyMaster'), emoji: '💎', ring: 'from-purple-400 via-pink-400 to-purple-500' };
    if (lvl >= 6) return { title: t('savingsPro'), emoji: '🚀', ring: 'from-blue-400 via-cyan-400 to-blue-500' };
    if (lvl >= 4) return { title: t('smartSaver'), emoji: '⚡', ring: 'from-primary via-accent to-primary' };
    if (lvl >= 2) return { title: t('risingStar'), emoji: '⭐', ring: 'from-green-400 via-emerald-400 to-green-500' };
    return { title: t('beginner'), emoji: '🌱', ring: 'from-muted-foreground via-muted to-muted-foreground' };
  };

  const rank = getRankInfo(level);

  const getStreakTier = (s: number) => {
    if (s >= 30) return { label: t('streakLegendary'), glow: 'shadow-amber-500/40', text: 'text-amber-400', bg: 'bg-amber-500/15' };
    if (s >= 14) return { label: t('streakEpic'), glow: 'shadow-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/15' };
    if (s >= 7) return { label: t('streakRare'), glow: 'shadow-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/15' };
    if (s >= 3) return { label: t('streakCommon'), glow: '', text: 'text-green-400', bg: 'bg-green-500/15' };
    return { label: '', glow: '', text: 'text-muted-foreground', bg: 'bg-secondary' };
  };

  const streakTier = getStreakTier(currentStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-4 rounded-2xl overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-primary/5" />
      
      <div className="relative p-4">
        {/* Top: Level + Rank + Streak */}
        <div className="flex items-center gap-3 mb-3">
          {/* Level ring */}
          <div className="relative">
            <motion.div
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${rank.ring} p-[2px]`}
              animate={level >= 6 ? { 
                boxShadow: ['0 0 12px hsl(var(--primary) / 0.3)', '0 0 24px hsl(var(--primary) / 0.5)', '0 0 12px hsl(var(--primary) / 0.3)']
              } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-xl">{rank.emoji}</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black border-2 border-card"
            >
              {level}
            </motion.div>
          </div>

          {/* Rank + XP */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              {t('level')} {level}
            </p>
            <p className="text-sm font-bold text-foreground truncate">{rank.title}</p>
            
            {/* XP Bar */}
            <div className="mt-1.5">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(xpProgress, 4)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full relative"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </motion.div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {xpNeeded} {t('deposits') || 'deposits'} → Lv.{level + 1}
              </p>
            </div>
          </div>

          {/* Streak badge */}
          {currentStreak > 0 && (
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl ${streakTier.bg} ${streakTier.glow && `shadow-lg ${streakTier.glow}`}`}
            >
              <motion.span 
                className="text-lg leading-none"
                animate={currentStreak >= 7 ? { 
                  scale: [1, 1.15, 1],
                  rotate: [0, -8, 8, 0],
                } : undefined}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                🔥
              </motion.span>
              <span className={`text-sm font-black leading-none ${streakTier.text}`}>
                {currentStreak}
              </span>
              {streakTier.label && (
                <span className={`text-[7px] font-bold uppercase tracking-wider ${streakTier.text} opacity-80`}>
                  {streakTier.label}
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: totalContributions, label: t('deposits'), icon: '💰' },
            { value: bestStreak, label: t('bestStreak'), icon: '🏆' },
            { value: formatCurrency(maxSaved), label: t('maxSaved'), icon: '💎' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center p-2.5 rounded-xl bg-secondary/50 border border-border/50"
            >
              <span className="text-sm block mb-0.5">{stat.icon}</span>
              <p className="text-sm font-bold text-foreground leading-tight">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UserStatsCard;
