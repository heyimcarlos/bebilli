import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  goal_amount: number;
  invite_code: string | null;
  created_by: string | null;
  created_at: string | null;
  group_type: 'individual' | 'shared';
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GroupMemberWithProfile {
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

export interface GroupWithDetails extends Group {
  members: GroupMemberWithProfile[];
  current_amount: number;
  user_contribution: number;
}

export type ContributionType = 'deposit' | 'withdrawal';

export const useGroups = (userId: string | undefined) => {
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch groups the user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from('group_memberships')
      .select('group_id')
      .eq('user_id', userId);

    if (membershipError || !memberships?.length) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Fetch hidden groups to filter them out
    const { data: hiddenGroups } = await supabase
      .from('hidden_groups')
      .select('group_id')
      .eq('user_id', userId);
    
    const hiddenGroupIds = new Set((hiddenGroups || []).map(h => h.group_id));
    const groupIds = memberships.map(m => m.group_id).filter(id => !hiddenGroupIds.has(id));

    if (groupIds.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Fetch groups using the secure view (hides invite_code for non-admins)
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups_public')
      .select('*')
      .in('id', groupIds);

    if (groupsError || !groupsData || groupsData.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Filter out any groups with null ids (shouldn't happen but TypeScript needs this)
    const validGroups = groupsData.filter((g): g is typeof g & { id: string; name: string; description: string | null; goal_amount: number; invite_code: string | null; created_by: string | null; created_at: string | null; group_type: 'individual' | 'shared' } => 
      g.id !== null && g.name !== null && g.goal_amount !== null
    );

    // For each group, fetch members with profiles and contributions
    const groupsWithDetails = await Promise.all(
      validGroups.map(async (group) => {
        // Fetch memberships
        const { data: memberships } = await supabase
          .from('group_memberships')
          .select('id, user_id, role')
          .eq('group_id', group.id);
        
        // Check if current user is admin of this group
        const isGroupAdmin = (memberships || []).some(m => m.user_id === userId && m.role === 'admin');
        
        // Fetch invite code for all group members (using secure RPC)
        const { data: inviteCode } = await supabase.rpc('get_group_invite_code', {
          group_uuid: group.id
        });
        
        // Fetch profiles from public view (excludes sensitive data like phone)
        const memberUserIds = (memberships || []).map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles_public')
          .select('id, name, avatar_url')
          .in('id', memberUserIds);
        
        const profilesMap = (profiles || []).reduce((acc, p) => {
          if (p.id) acc[p.id] = p;
          return acc;
        }, {} as Record<string, typeof profiles[0]>);
        
        const members = (memberships || []).map(m => ({
          ...m,
          profiles: profilesMap[m.user_id] || { id: m.user_id, name: 'Unknown', avatar_url: null }
        }));

        // Fetch contributions totals (accounting for deposits and withdrawals)
        const { data: contributions } = await supabase
          .from('contributions')
          .select('user_id, amount, type')
          .eq('group_id', group.id);

        const contributionsByUser = (contributions || []).reduce((acc, c) => {
          const amount = Number(c.amount);
          const adjustedAmount = c.type === 'withdrawal' ? -amount : amount;
          acc[c.user_id] = (acc[c.user_id] || 0) + adjustedAmount;
          return acc;
        }, {} as Record<string, number>);

        const totalAmount = Math.max(0, Object.values(contributionsByUser).reduce((sum, val) => sum + val, 0));
        const userContribution = contributionsByUser[userId] || 0;

        const membersWithContributions: GroupMemberWithProfile[] = (members || []).map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          role: m.role,
          profile: m.profiles,
          total_contribution: contributionsByUser[m.user_id] || 0,
        }));

        return {
          ...group,
          invite_code: inviteCode, // Use the fetched invite code for admins
          members: membersWithContributions.sort((a, b) => b.total_contribution - a.total_contribution),
          current_amount: totalAmount,
          user_contribution: userContribution,
        } as GroupWithDetails;
      })
    );

    setGroups(groupsWithDetails);
    setLoading(false);
  }, [userId]);

  // Set up realtime subscription
  useEffect(() => {
    fetchGroups();

    // Subscribe to contribution changes
    if (userId) {
      channelRef.current = supabase
        .channel('contributions-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'contributions',
          },
          async (payload) => {
            console.log('Realtime contribution update:', payload);
            const newContribution = payload.new as { user_id: string; amount: number; group_id: string; type?: string };
            
            // Show toast only for other users' contributions
            if (newContribution.user_id !== userId) {
              // Fetch the contributor's profile from public view
              const { data: profile } = await supabase
                .from('profiles_public')
                .select('name')
                .eq('id', newContribution.user_id)
                .single();
              
              // Find the group name
              const group = groups.find(g => g.id === newContribution.group_id);
              
              const isWithdrawal = newContribution.type === 'withdrawal';
              
              toast({
                title: isWithdrawal ? '💸 Withdrawal' : '💰 New contribution!',
                description: isWithdrawal 
                  ? `${profile?.name || 'A member'} withdrew $${newContribution.amount.toFixed(2)} from ${group?.name || 'a group'}`
                  : `${profile?.name || 'A member'} added $${newContribution.amount.toFixed(2)} to ${group?.name || 'a group'}`,
              });
            }
            
            // Refresh groups
            fetchGroups();
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchGroups, userId]);

  const createGroup = async (name: string, goalAmount: number, imageUrl?: string, description?: string, groupType: 'individual' | 'shared' = 'shared') => {
    if (!userId) return { error: new Error('Not authenticated') };

    // Use the secure database function to create group atomically
    const { data, error } = await supabase.rpc('create_group_with_admin', {
      group_name: name,
      group_goal_amount: goalAmount,
      group_image_url: imageUrl || null,
      group_description: description || null,
      group_type: groupType,
    });

    if (error) {
      console.error('Error creating group:', error);
      return { error: new Error(error.message) };
    }

    const result = data as { success: boolean; error?: string; group_id?: string; group_name?: string; invite_code?: string };

    if (!result.success) {
      return { error: new Error(result.error || 'Failed to create group') };
    }

    await fetchGroups();
    return { 
      data: { id: result.group_id, name: result.group_name, invite_code: result.invite_code }, 
      error: null 
    };
  };

  const joinGroupByCode = async (inviteCode: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    // Use the secure database function to join by code
    const { data, error } = await supabase.rpc('join_group_by_invite_code', {
      invite_code_input: inviteCode.toUpperCase()
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    const result = data as { success: boolean; error?: string; group_id?: string; group_name?: string };

    if (!result.success) {
      return { error: new Error(result.error || 'Failed to join group') };
    }

    await fetchGroups();
    return { 
      data: { id: result.group_id, name: result.group_name }, 
      error: null 
    };
  };

  const addContribution = async (groupId: string, amount: number, note?: string, type: ContributionType = 'deposit') => {
    if (!userId) return { error: new Error('Not authenticated') };

    // For withdrawals, check if user has enough balance
    if (type === 'withdrawal') {
      const group = groups.find(g => g.id === groupId);
      if (group && group.user_contribution < amount) {
        return { error: new Error('Insufficient balance for withdrawal') };
      }
    }

    const { data, error } = await supabase
      .from('contributions')
      .insert({
        group_id: groupId,
        user_id: userId,
        amount,
        note,
        type,
      })
      .select()
      .single();

    if (!error) {
      await fetchGroups();
    }

    return { data, error };
  };

  const addWithdrawal = async (groupId: string, amount: number, note?: string) => {
    return addContribution(groupId, amount, note, 'withdrawal');
  };

  const leaveGroup = async (groupId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (!error) {
      await fetchGroups();
    }

    return { error };
  };

  // Note: goal_amount cannot be changed after group creation
  const updateGroup = async (groupId: string, updates: { name?: string; description?: string; image_url?: string }) => {
    if (!userId) return { error: new Error('Not authenticated') };

    // Ensure goal_amount is never included in updates
    const safeUpdates = {
      name: updates.name,
      description: updates.description,
      image_url: updates.image_url,
    };

    // Remove undefined values
    Object.keys(safeUpdates).forEach(key => {
      if (safeUpdates[key as keyof typeof safeUpdates] === undefined) {
        delete safeUpdates[key as keyof typeof safeUpdates];
      }
    });

    const { data, error } = await supabase
      .from('groups')
      .update(safeUpdates)
      .eq('id', groupId)
      .select()
      .single();

    if (!error) {
      await fetchGroups();
    }

    return { data, error };
  };

  const deleteGroup = async (groupId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    // First check if user is admin
    const group = groups.find(g => g.id === groupId);
    const isAdmin = group?.members.some(m => m.user_id === userId && m.role === 'admin');
    
    if (!isAdmin) {
      return { error: new Error('Only admins can delete groups') };
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (!error) {
      await fetchGroups();
    }

    return { error };
  };

  const hideGroup = async (groupId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('hidden_groups')
      .insert({
        user_id: userId,
        group_id: groupId,
      });

    if (!error) {
      await fetchGroups();
    }

    return { error };
  };

  const unhideGroup = async (groupId: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('hidden_groups')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (!error) {
      await fetchGroups();
    }

    return { error };
  };

  return {
    groups,
    loading,
    fetchGroups,
    createGroup,
    joinGroupByCode,
    addContribution,
    addWithdrawal,
    leaveGroup,
    updateGroup,
    deleteGroup,
    hideGroup,
    unhideGroup,
  };
};
