import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import DefaultAvatar from '@/components/DefaultAvatar';

interface Member {
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

interface ConsistencyData {
  user_id: string;
  current_streak: number;
  best_streak: number;
  consistency_days: number;
}

interface ConsistencyRankingProps {
  members: Member[];
  currentUserId?: string;
}

const ConsistencyRanking: React.FC<ConsistencyRankingProps> = ({ members, currentUserId }) => {
  const { t } = useApp();
  const [consistencyData, setConsistencyData] = useState<ConsistencyData[]>([]);

  useEffect(() => {
    const fetchConsistency = async () => {
      const userIds = members.map(m => m.user_id);
      if (userIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, current_streak, best_streak, consistency_days')
        .in('id', userIds);

      if (data) {
        setConsistencyData(data.map(d => ({
          user_id: d.id,
          current_streak: d.current_streak || 0,
          best_streak: d.best_streak || 0,
          consistency_days: d.consistency_days || 0,
        })));
      }
    };
    fetchConsistency();
  }, [members]);

  const rankedMembers = members
    .map(m => {
      const cd = consistencyData.find(c => c.user_id === m.user_id);
      return { ...m, streak: cd?.current_streak || 0, bestStreak: cd?.best_streak || 0 };
    })
    .sort((a, b) => b.streak - a.streak || b.bestStreak - a.bestStreak);

  const getStreakTier = (streak: number) => {
    if (streak >= 100) return { label: '🔥 Legendary', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (streak >= 30) return { label: '⚡ Epic', color: 'text-purple-400', bg: 'bg-purple-500/10' };
    if (streak >= 7) return { label: '💪 Rare', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    return { label: '🌱 Common', color: 'text-muted-foreground', bg: 'bg-secondary' };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2 pb-24"
    >
      {rankedMembers.map((member, index) => {
        const tier = getStreakTier(member.streak);
        const isCurrentUser = member.user_id === currentUserId;

        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`glass-card p-3 flex items-center gap-3 ${isCurrentUser ? 'border-primary/40 bg-primary/5' : ''}`}
          >
            {/* Rank */}
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {member.profile.avatar_url ? (
                <img src={member.profile.avatar_url} alt={member.profile.name} className="w-full h-full object-cover" />
              ) : (
                <DefaultAvatar name={member.profile.name} size={40} className="w-full h-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">
                {member.profile.name}
                {isCurrentUser && <span className="text-xs text-primary ml-1.5">{t('youUser')}</span>}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tier.bg} ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
            </div>

            {/* Streak */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm font-bold">{member.streak}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                best: {member.bestStreak}
              </p>
            </div>
          </motion.div>
        );
      })}

      {members.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('noMembersYet')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ConsistencyRanking;
