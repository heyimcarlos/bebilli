import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Star, TrendingUp, Zap } from 'lucide-react';
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
  const { formatCurrency } = useApp();

  const getLevelTitle = (level: number) => {
    if (level >= 10) return { title: 'Billionaire Legend', emoji: '👑' };
    if (level >= 8) return { title: 'Money Master', emoji: '💎' };
    if (level >= 6) return { title: 'Savings Pro', emoji: '🚀' };
    if (level >= 4) return { title: 'Smart Saver', emoji: '⭐' };
    if (level >= 2) return { title: 'Rising Star', emoji: '🌟' };
    return { title: 'Beginner', emoji: '🌱' };
  };

  const levelInfo = getLevelTitle(level);
  const progressToNextLevel = ((level % 1) || 0.5) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-4"
    >
      {/* Level Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl"
          >
            {levelInfo.emoji}
          </motion.div>
          <div>
            <p className="text-xs text-muted-foreground">Level {level}</p>
            <p className="font-semibold text-foreground">{levelInfo.title}</p>
          </div>
        </div>
        
        {/* Streak Fire */}
        {currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-destructive/20 border border-destructive/30"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity, 
                repeatDelay: 1 
              }}
            >
              <Flame className="w-4 h-4 text-destructive" />
            </motion.div>
            <span className="text-sm font-bold text-destructive">{currentStreak}</span>
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-center p-3 rounded-xl bg-secondary/50"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <p className="text-lg font-bold text-foreground">{totalContributions}</p>
          <p className="text-xs text-muted-foreground">Deposits</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-center p-3 rounded-xl bg-secondary/50"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-accent" />
          </div>
          <p className="text-lg font-bold text-foreground">{bestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-center p-3 rounded-xl bg-secondary/50"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-success" />
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(maxSaved)}</p>
          <p className="text-xs text-muted-foreground">Max Saved</p>
        </motion.div>
      </div>

      {/* Level Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress to Level {level + 1}</span>
          <span className="text-primary">{Math.round(progressToNextLevel)}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: 'var(--gradient-primary)' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default UserStatsCard;
