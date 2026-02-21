import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, EyeOff, Eye, Users, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HiddenGroup {
  id: string;
  name: string;
  image_url: string | null;
  goal_amount: number;
  current_amount: number;
  members_count: number;
}

interface HiddenGroupsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupUnhide?: () => void;
}

const HiddenGroupsDrawer: React.FC<HiddenGroupsDrawerProps> = ({
  isOpen,
  onClose,
  onGroupUnhide,
}) => {
  const { t, formatCurrency } = useApp();
  const { user, unhideGroup, refreshGroups } = useAuthContext();
  const { toast } = useToast();
  const [hiddenGroups, setHiddenGroups] = useState<HiddenGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [unhiding, setUnhiding] = useState<string | null>(null);

  const fetchHiddenGroups = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    // Get hidden group IDs
    const { data: hidden, error: hiddenError } = await supabase
      .from('hidden_groups')
      .select('group_id')
      .eq('user_id', user.id);

    if (hiddenError || !hidden?.length) {
      setHiddenGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = hidden.map(h => h.group_id);

    // Fetch group details
    const { data: groups, error: groupsError } = await supabase
      .from('groups_public')
      .select('*')
      .in('id', groupIds);

    if (groupsError || !groups) {
      setHiddenGroups([]);
      setLoading(false);
      return;
    }

    // Get member counts and contributions for each group
    const groupsWithDetails = await Promise.all(
      groups.map(async (group) => {
        const { count: membersCount } = await supabase
          .from('group_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        const { data: contributions } = await supabase
          .from('contributions')
          .select('amount')
          .eq('group_id', group.id);

        const currentAmount = (contributions || []).reduce(
          (sum, c) => sum + Number(c.amount),
          0
        );

        return {
          id: group.id!,
          name: group.name || 'Unknown',
          image_url: group.image_url,
          goal_amount: group.goal_amount || 0,
          current_amount: currentAmount,
          members_count: membersCount || 0,
        };
      })
    );

    setHiddenGroups(groupsWithDetails);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchHiddenGroups();
    }
  }, [isOpen, user?.id]);

  const handleUnhide = async (groupId: string) => {
    setUnhiding(groupId);
    const { error } = await unhideGroup(groupId);
    setUnhiding(null);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '👁️ ' + t('groupUnhidden'),
        description: t('groupUnhiddenDesc'),
      });
      setHiddenGroups(prev => prev.filter(g => g.id !== groupId));
      await refreshGroups();
      onGroupUnhide?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">{t('hiddenGroups')}</h2>
                  <p className="text-xs text-muted-foreground">
                    {hiddenGroups.length} {t('groups')}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-80px)]">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : hiddenGroups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {t('noHiddenGroups')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('noHiddenGroupsDesc')}
                  </p>
                </motion.div>
              ) : (
                hiddenGroups.map((group, index) => {
                  const progress = group.goal_amount > 0 
                    ? (group.current_amount / group.goal_amount) * 100 
                    : 0;

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 space-y-3"
                    >
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={group.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400'}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{group.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{group.members_count} {t('members')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            className="h-full bg-primary/50 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{formatCurrency(group.current_amount)}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Unhide Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleUnhide(group.id)}
                        disabled={unhiding === group.id}
                      >
                        {unhiding === group.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('showGroup')}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HiddenGroupsDrawer;
