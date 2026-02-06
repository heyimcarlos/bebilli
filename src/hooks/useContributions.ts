import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ContributionType = 'deposit' | 'withdrawal';

export interface ContributionWithDetails {
  id: string;
  amount: number;
  note: string | null;
  created_at: string;
  user_id: string;
  group_id: string;
  type: ContributionType;
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  group: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

export const useContributions = (userId: string | undefined) => {
  const [contributions, setContributions] = useState<ContributionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = useCallback(async () => {
    if (!userId) {
      setContributions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // First get the user's group memberships
    const { data: memberships } = await supabase
      .from('group_memberships')
      .select('group_id')
      .eq('user_id', userId);

    if (!memberships?.length) {
      setContributions([]);
      setLoading(false);
      return;
    }

    const groupIds = memberships.map(m => m.group_id);

    // Fetch all contributions from user's groups
    const { data: contributionsData, error } = await supabase
      .from('contributions')
      .select('*')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !contributionsData) {
      setContributions([]);
      setLoading(false);
      return;
    }

    // Fetch profiles and groups
    const userIds = [...new Set(contributionsData.map(c => c.user_id))];
    
    const [profilesResult, groupsResult] = await Promise.all([
      supabase.from('profiles').select('id, name, avatar_url').in('id', userIds),
      supabase.from('groups').select('id, name, image_url').in('id', groupIds),
    ]);

    const profilesMap = (profilesResult.data || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, { id: string; name: string; avatar_url: string | null }>);

    const groupsMap = (groupsResult.data || []).reduce((acc, g) => {
      acc[g.id] = g;
      return acc;
    }, {} as Record<string, { id: string; name: string; image_url: string | null }>);

    const enrichedContributions: ContributionWithDetails[] = contributionsData.map(c => ({
      id: c.id,
      amount: c.amount,
      note: c.note,
      created_at: c.created_at || new Date().toISOString(),
      user_id: c.user_id,
      group_id: c.group_id,
      type: (c as any).type || 'deposit',
      profile: profilesMap[c.user_id] || { id: c.user_id, name: 'Unknown', avatar_url: null },
      group: groupsMap[c.group_id] || { id: c.group_id, name: 'Unknown', image_url: null },
    }));

    setContributions(enrichedContributions);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  return {
    contributions,
    loading,
    refetch: fetchContributions,
  };
};
