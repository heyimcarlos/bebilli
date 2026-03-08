import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Flame, TrendingUp, Crown, Eye, EyeOff, Percent } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DefaultAvatar from '@/components/DefaultAvatar';

interface LeaderboardMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  total_contribution: number;
  salary?: number | null;
  show_amount?: boolean;
  checkin_count?: number;
  savings_percentage?: number | null;
}

interface AnimatedLeaderboardProps {
  members: LeaderboardMember[];
  currentUserId?: string;
  formatCurrency: (amount: number) => string;
  isOpenGoal?: boolean;
}

const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({
  members,
  currentUserId,
  formatCurrency,
  isOpenGoal = false,
}) => {
  const { t } = useApp();

  const getDisplayValue = (member: LeaderboardMember): string => {
    if (!member.show_amount && member.user_id !== currentUserId) {
      return `${member.checkin_count || 0} check-ins`;
    }
    if (isOpenGoal && member.savings_percentage !== null && member.savings_percentage !== undefined) {
      return `${member.savings_percentage.toFixed(1)}%`;
    }
    return formatCurrency(member.total_contribution);
  };

  const getSubValue = (member: LeaderboardMember): string | null => {
    if (!member.show_amount && member.user_id !== currentUserId) return null;
    if (isOpenGoal && member.savings_percentage !== null) {
      return formatCurrency(member.total_contribution);
    }
    if (member.checkin_count && member.checkin_count > 0) {
      return `${member.checkin_count} check-ins`;
    }
    return null;
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return { icon: Crown, color: 'text-amber-400', label: '🥇' };
      case 1:
        return { icon: Medal, color: 'text-slate-300', label: '🥈' };
      case 2:
        return { icon: Trophy, color: 'text-amber-600', label: '🥉' };
      default:
        return null;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -30, scale: 0.9 },
    show: { 
      opacity: 1, x: 0, scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
  };

  const topThree = members.slice(0, 3);
  const rest = members.slice(3);

  const renderPodiumMember = (member: LeaderboardMember, rank: number) => {
    const sizes = rank === 0 
      ? { avatar: 72, border: 'border-amber-400', w: 'w-20', h: 'h-24', maxW: 'max-w-[80px]', textSize: 'text-sm' }
      : rank === 1 
      ? { avatar: 56, border: 'border-slate-300', w: 'w-16', h: 'h-16', maxW: 'max-w-[70px]', textSize: 'text-xs' }
      : { avatar: 48, border: 'border-amber-600', w: 'w-14', h: 'h-12', maxW: 'max-w-[70px]', textSize: 'text-xs' };
    
    const delays = [0.1, 0.3, 0.5];
    const gradients = [
      'from-amber-500/50 to-amber-400/30',
      'from-slate-400/50 to-slate-300/30', 
      'from-amber-700/50 to-amber-600/30',
    ];
    const emojis = ['🥇', '🥈', '🥉'];

    return (
      <motion.div
        key={member.id}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: delays[rank], type: 'spring', stiffness: 200 }}
        className={`flex flex-col items-center ${rank === 0 ? '-mt-6' : ''}`}
      >
        {rank === 0 && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Crown className="w-6 h-6 text-amber-400 mb-1" />
          </motion.div>
        )}
        <div className="relative mb-2">
          <motion.div
            className={`rounded-full overflow-hidden border-2 ${sizes.border}`}
            style={{ width: sizes.avatar, height: sizes.avatar }}
            whileHover={{ scale: 1.1 }}
            {...(rank === 0 ? {
              animate: {
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                  '0 0 40px rgba(251, 191, 36, 0.5)',
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                ],
              },
              transition: { boxShadow: { duration: 2, repeat: Infinity } },
            } : {})}
          >
            {member.profile.avatar_url ? (
              <img src={member.profile.avatar_url} alt={member.profile.name} className="w-full h-full object-cover" />
            ) : (
              <DefaultAvatar name={member.profile.name} size={sizes.avatar} className="w-full h-full" />
            )}
          </motion.div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg">{emojis[rank]}</span>
        </div>
        <p className={`${sizes.textSize} font-medium truncate ${sizes.maxW} text-center`}>
          {member.profile.name}
        </p>
        <p className={`${sizes.textSize} ${rank === 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
          {getDisplayValue(member)}
        </p>
        {getSubValue(member) && (
          <p className="text-[10px] text-muted-foreground">{getSubValue(member)}</p>
        )}
        <div className={`${sizes.w} ${sizes.h} bg-gradient-to-t ${gradients[rank]} rounded-t-lg mt-2`} />
      </motion.div>
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Competition badge */}
      {isOpenGoal && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mx-auto w-fit"
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            {t('competitionMode') || 'Competition Mode'}
          </span>
          <Percent className="w-3 h-3 text-amber-500" />
        </motion.div>
      )}

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-2 mb-6 h-40">
          {topThree[1] && renderPodiumMember(topThree[1], 1)}
          {topThree[0] && renderPodiumMember(topThree[0], 0)}
          {topThree[2] && renderPodiumMember(topThree[2], 2)}
        </div>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {rest.map((member, index) => (
            <motion.div
              key={member.id}
              variants={item}
              className={`glass-card p-3 flex items-center gap-3 ${
                member.user_id === currentUserId ? 'border-primary/50 bg-primary/5' : ''
              }`}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm">
                {index + 4}
              </div>
              
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {member.profile.avatar_url ? (
                  <img src={member.profile.avatar_url} alt={member.profile.name} className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar name={member.profile.name} size={40} className="w-full h-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">
                  {member.profile.name}
                  {member.user_id === currentUserId && (
                    <span className="text-xs text-primary ml-2">{t('youUser')}</span>
                  )}
                </p>
                {getSubValue(member) && (
                  <p className="text-[10px] text-muted-foreground">{getSubValue(member)}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!member.show_amount && member.user_id !== currentUserId ? (
                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-success" />
                )}
                <span className="text-sm font-semibold text-primary">
                  {getDisplayValue(member)}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {members.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('noMembersYet')}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedLeaderboard;
