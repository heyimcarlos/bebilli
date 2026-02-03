import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Trophy, Flame, Star } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface EnhancedGroupCardProps {
  id: string;
  name: string;
  image: string;
  goal: number;
  current: number;
  membersCount: number;
  onClick: () => void;
  rank?: number;
}

const EnhancedGroupCard: React.FC<EnhancedGroupCardProps> = ({
  name,
  image,
  goal,
  current,
  membersCount,
  onClick,
  rank,
}) => {
  const { formatCurrency, t } = useApp();
  const progress = (current / goal) * 100;

  const getMilestone = () => {
    if (progress >= 100) return { icon: Trophy, color: 'text-accent', bg: 'bg-accent/20', label: 'GOAL!' };
    if (progress >= 75) return { icon: Star, color: 'text-primary', bg: 'bg-primary/20', label: '75%' };
    if (progress >= 50) return { icon: Flame, color: 'text-destructive', bg: 'bg-destructive/20', label: '50%' };
    if (progress >= 25) return { icon: TrendingUp, color: 'text-success', bg: 'bg-success/20', label: '25%' };
    return null;
  };

  const milestone = getMilestone();

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full glass-card p-4 hover:border-primary/30 transition-all duration-300 group text-left relative overflow-hidden"
    >
      {/* Progress glow effect */}
      {progress >= 50 && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${Math.min(progress, 100)}% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            rank === 1 ? 'bg-accent text-accent-foreground' :
            rank === 2 ? 'bg-muted-foreground/50 text-foreground' :
            'bg-orange-700/50 text-foreground'
          }`}
        >
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </motion.div>
      )}

      <div className="flex gap-4 relative">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          
          {/* Milestone Badge */}
          {milestone && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute bottom-1 right-1 ${milestone.bg} ${milestone.color} rounded-full p-1`}
            >
              <milestone.icon className="w-3 h-3" />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">{name}</h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Users className="w-3 h-3" />
            <span>{membersCount} {t('members')}</span>
            {milestone && (
              <span className={`${milestone.color} font-semibold`}>
                • {milestone.label}
              </span>
            )}
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative h-3 rounded-full overflow-hidden bg-secondary mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {/* Shimmer effect on progress bar */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatCurrency(current)} {t('of')} {formatCurrency(goal)}
            </span>
            <motion.span 
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-primary font-semibold flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              {progress.toFixed(0)}%
            </motion.span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default EnhancedGroupCard;
