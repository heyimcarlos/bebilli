import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import EnhancedGroupCard from '@/components/EnhancedGroupCard';

interface MyGroupsPageProps {
  onGroupClick: (groupId: string) => void;
}

const MyGroupsPage: React.FC<MyGroupsPageProps> = ({ onGroupClick }) => {
  const { t } = useApp();
  const { groups, groupsLoading } = useAuthContext();

  const sortedGroups = [...groups].sort((a, b) => {
    const aProgress = a.goal_amount > 0 ? a.current_amount / a.goal_amount : 0;
    const bProgress = b.goal_amount > 0 ? b.current_amount / b.goal_amount : 0;
    return bProgress - aProgress;
  });

  return (
    <div className="px-6 pt-6 pb-24">
      <motion.h1
        className="text-2xl font-black mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t('myGroups')}
      </motion.h1>

      {groupsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <p className="text-muted-foreground mb-2">{t('noGroupsYet')}</p>
          <p className="text-sm text-muted-foreground">{t('createOrJoin')}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map((group, index) => {
            const isPending = (group as any).group_type === 'shared' && group.members.length < 2;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EnhancedGroupCard
                  id={group.id}
                  name={group.name}
                  image={group.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
                  goal={group.goal_amount}
                  current={group.current_amount}
                  membersCount={group.members.length}
                  onClick={() => onGroupClick(group.id)}
                  rank={index + 1}
                  groupType={(group as any).group_type || 'shared'}
                  isPending={isPending}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGroupsPage;
