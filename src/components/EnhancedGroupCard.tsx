import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Target } from 'lucide-react';
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
  groupType?: 'individual' | 'shared';
  isPending?: boolean;
}

const EnhancedGroupCard: React.FC<EnhancedGroupCardProps> = ({
  name,
  image,
  goal,
  current,
  membersCount,
  onClick,
  rank,
  groupType = 'shared',
  isPending = false,
}) => {
  const { formatCurrency, t } = useApp();
  const progress = Math.min((current / goal) * 100, 100);

  const getQuestStatus = () => {
    if (progress >= 100) return { label: t('questComplete'), emoji: '🏆', accent: 'border-accent/40 bg-accent/5' };
    if (progress >= 75) return { label: '75%', emoji: '🔥', accent: 'border-primary/30 bg-primary/5' };
    if (progress >= 50) return { label: '50%', emoji: '⚡', accent: 'border-blue-500/30 bg-blue-500/5' };
    if (progress >= 25) return { label: '25%', emoji: '📈', accent: 'border-green-500/30 bg-green-500/5' };
    return { label: t('questNew'), emoji: '🎯', accent: 'border-border bg-card/60' };
  };

  const quest = getQuestStatus();
  const rankBadges = ['', '🥇', '🥈', '🥉'];

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full rounded-2xl p-3.5 border transition-all duration-200 text-left relative overflow-hidden ${isPending ? 'border-amber-500/30 bg-amber-500/5 opacity-80' : quest.accent}`}
    >
      {isPending && (
        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{t('pendingActivation')}</span>
        </div>
      )}
      <div className="flex gap-3.5">
        {/* Image with rank overlay */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
          
          {/* Rank badge */}
          {rank && rank <= 3 && (
            <div className="absolute top-0.5 left-0.5 text-sm leading-none">
              {rankBadges[rank]}
            </div>
          )}

          {/* Quest status pip */}
          <div className="absolute bottom-1 right-1">
            <span className="text-xs">{quest.emoji}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title + members */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-sm text-foreground truncate leading-tight">{name}</h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <Users className="w-3 h-3" />
              <span>{membersCount}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2.5 rounded-full overflow-hidden bg-secondary mb-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 2)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full relative"
              style={{ background: progress >= 100 ? 'var(--gradient-gold)' : 'var(--gradient-primary)' }}
            >
              {progress > 15 && (
                <motion.div
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              )}
            </motion.div>
          </div>
          
          {/* Amount + percentage */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {formatCurrency(current)} <span className="opacity-50">/</span> {formatCurrency(goal)}
            </span>
            <span className="font-bold text-primary flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default EnhancedGroupCard;
