import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Flame, TrendingUp, Crown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

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
}

interface AnimatedLeaderboardProps {
  members: LeaderboardMember[];
  currentUserId?: string;
  formatCurrency: (amount: number) => string;
}

const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({
  members,
  currentUserId,
  formatCurrency,
}) => {
  const { t } = useApp();

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: Crown,
          color: 'text-amber-400',
          bg: 'bg-gradient-to-br from-amber-400/30 to-yellow-500/20',
          glow: 'shadow-amber-400/30',
          label: '🥇',
        };
      case 1:
        return {
          icon: Medal,
          color: 'text-slate-300',
          bg: 'bg-gradient-to-br from-slate-300/30 to-slate-400/20',
          glow: 'shadow-slate-400/30',
          label: '🥈',
        };
      case 2:
        return {
          icon: Trophy,
          color: 'text-amber-600',
          bg: 'bg-gradient-to-br from-amber-600/30 to-orange-700/20',
          glow: 'shadow-amber-600/30',
          label: '🥉',
        };
      default:
        return null;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -30, scale: 0.9 },
    show: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const topThree = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-2 mb-6 h-40">
          {/* Second Place */}
          {topThree[1] && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <motion.div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-300"
                  whileHover={{ scale: 1.1 }}
                >
                  {topThree[1].profile.avatar_url ? (
                    <img
                      src={topThree[1].profile.avatar_url}
                      alt={topThree[1].profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-lg font-bold">
                      {topThree[1].profile.name.charAt(0)}
                    </div>
                  )}
                </motion.div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg">🥈</span>
              </div>
              <p className="text-xs font-medium truncate max-w-[70px] text-center">
                {topThree[1].profile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(topThree[1].total_contribution)}
              </p>
              <div className="w-16 h-16 bg-gradient-to-t from-slate-400/50 to-slate-300/30 rounded-t-lg mt-2" />
            </motion.div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center -mt-6"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Crown className="w-6 h-6 text-amber-400 mb-1" />
              </motion.div>
              <div className="relative mb-2">
                <motion.div
                  className="w-18 h-18 rounded-full overflow-hidden border-3 border-amber-400"
                  style={{ width: '72px', height: '72px' }}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(251, 191, 36, 0.3)',
                      '0 0 40px rgba(251, 191, 36, 0.5)',
                      '0 0 20px rgba(251, 191, 36, 0.3)',
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity },
                  }}
                >
                  {topThree[0].profile.avatar_url ? (
                    <img
                      src={topThree[0].profile.avatar_url}
                      alt={topThree[0].profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-xl font-bold text-white">
                      {topThree[0].profile.name.charAt(0)}
                    </div>
                  )}
                </motion.div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xl">🥇</span>
              </div>
              <p className="text-sm font-semibold truncate max-w-[80px] text-center">
                {topThree[0].profile.name}
              </p>
              <p className="text-sm text-primary font-bold">
                {formatCurrency(topThree[0].total_contribution)}
              </p>
              <div className="w-20 h-24 bg-gradient-to-t from-amber-500/50 to-amber-400/30 rounded-t-lg mt-2" />
            </motion.div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <motion.div
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600"
                  whileHover={{ scale: 1.1 }}
                >
                  {topThree[2].profile.avatar_url ? (
                    <img
                      src={topThree[2].profile.avatar_url}
                      alt={topThree[2].profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-lg font-bold">
                      {topThree[2].profile.name.charAt(0)}
                    </div>
                  )}
                </motion.div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-lg">🥉</span>
              </div>
              <p className="text-xs font-medium truncate max-w-[70px] text-center">
                {topThree[2].profile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(topThree[2].total_contribution)}
              </p>
              <div className="w-14 h-12 bg-gradient-to-t from-amber-700/50 to-amber-600/30 rounded-t-lg mt-2" />
            </motion.div>
          )}
        </div>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
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
                  <img
                    src={member.profile.avatar_url}
                    alt={member.profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center font-semibold">
                    {member.profile.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">
                  {member.profile.name}
                  {member.user_id === currentUserId && (
                    <span className="text-xs text-primary ml-2">{t('youUser')}</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(member.total_contribution)}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {members.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('noMembersYet')}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedLeaderboard;
