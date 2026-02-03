import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  image_url: string | null;
  goal_amount: number;
  invite_code: string;
  created_by: string | null;
  created_at: string;
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

    const groupIds = memberships.map(m => m.group_id);

    // Fetch groups using the secure view (hides invite_code for non-admins)
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups_public')
      .select('*')
      .in('id', groupIds);

    if (groupsError || !groupsData) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // For each group, fetch members with profiles and contributions
    const groupsWithDetails = await Promise.all(
      groupsData.map(async (group) => {
        // Fetch memberships with profiles
        const { data: members } = await supabase
          .from('group_memberships')
          .select(`
            id,
            user_id,
            role,
            profiles!inner (
              id,
              name,
              avatar_url
            )
          `)
          .eq('group_id', group.id);

        // Fetch contributions totals
        const { data: contributions } = await supabase
          .from('contributions')
          .select('user_id, amount')
          .eq('group_id', group.id);

        const contributionsByUser = (contributions || []).reduce((acc, c) => {
          acc[c.user_id] = (acc[c.user_id] || 0) + Number(c.amount);
          return acc;
        }, {} as Record<string, number>);

        const totalAmount = Object.values(contributionsByUser).reduce((sum, val) => sum + val, 0);
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
            const newContribution = payload.new as { user_id: string; amount: number; group_id: string };
            
            // Show toast only for other users' contributions
            if (newContribution.user_id !== userId) {
              // Fetch the contributor's profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', newContribution.user_id)
                .single();
              
              // Find the group name
              const group = groups.find(g => g.id === newContribution.group_id);
              
              toast({
                title: '💰 New contribution!',
                description: `${profile?.name || 'A member'} added $${newContribution.amount.toFixed(2)} to ${group?.name || 'a group'}`,
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

  const createGroup = async (name: string, goalAmount: number, imageUrl?: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        goal_amount: goalAmount,
        image_url: imageUrl || null,
        created_by: userId,
      })
      .select()
      .single();

    if (groupError || !group) return { error: groupError };

    // Add creator as admin
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'admin',
      });

    if (membershipError) return { error: membershipError };

    await fetchGroups();
    return { data: group, error: null };
  };

  const joinGroupByCode = async (inviteCode: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .maybeSingle();

    if (groupError || !group) {
      return { error: new Error('Invalid invite code') };
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_memberships')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return { error: new Error('Already a member of this group') };
    }

    // Join the group
    const { error: joinError } = await supabase
      .from('group_memberships')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'member',
      });

    if (joinError) return { error: joinError };

    await fetchGroups();
    return { data: group, error: null };
  };

  const addContribution = async (groupId: string, amount: number, note?: string) => {
    if (!userId) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('contributions')
      .insert({
        group_id: groupId,
        user_id: userId,
        amount,
        note,
      })
      .select()
      .single();

    if (!error) {
      await fetchGroups();
    }

    return { data, error };
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

  return {
    groups,
    loading,
    fetchGroups,
    createGroup,
    joinGroupByCode,
    addContribution,
    leaveGroup,
  };
};
