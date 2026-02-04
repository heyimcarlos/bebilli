import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FREE_GROUP_LIMIT = 4;

export const usePremiumCheck = (userId?: string) => {
  const [isPremium, setIsPremium] = useState(false);
  const [groupCount, setGroupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const checkPremiumStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Check premium status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    setIsPremium(profile?.is_premium || false);

    // Count user's groups
    const { count } = await supabase
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    setGroupCount(count || 0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  const canCreateOrJoinGroup = () => {
    if (isPremium) return true;
    return groupCount < FREE_GROUP_LIMIT;
  };

  const getRemainingFreeSlots = () => {
    if (isPremium) return Infinity;
    return Math.max(0, FREE_GROUP_LIMIT - groupCount);
  };

  return {
    isPremium,
    groupCount,
    loading,
    canCreateOrJoinGroup,
    getRemainingFreeSlots,
    freeLimit: FREE_GROUP_LIMIT,
    refresh: checkPremiumStatus,
  };
};
