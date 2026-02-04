import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  created_at: string;
  members_count: number;
  is_member: boolean;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: {
    name: string;
    avatar_url: string | null;
  };
}

export const useCommunities = (userId?: string) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch communities with member count
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('*');

      if (communitiesError) throw communitiesError;

      // Fetch member counts
      const { data: membersData } = await supabase
        .from('community_members')
        .select('community_id');

      // Count members per community
      const memberCounts: Record<string, number> = {};
      membersData?.forEach(m => {
        memberCounts[m.community_id] = (memberCounts[m.community_id] || 0) + 1;
      });

      // Check which communities the user is a member of
      let userMemberships: string[] = [];
      if (userId) {
        const { data: userMembers } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', userId);
        userMemberships = userMembers?.map(m => m.community_id) || [];
      }

      const enrichedCommunities: Community[] = (communitiesData || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        image_url: c.image_url,
        category: c.category,
        created_at: c.created_at,
        members_count: memberCounts[c.id] || 0,
        is_member: userMemberships.includes(c.id),
      }));

      setCommunities(enrichedCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const createCommunity = async (data: { name: string; description: string; category: string; image_url?: string }) => {
    if (!userId) return { error: { message: 'User not authenticated' } };

    const { data: newCommunity, error } = await supabase
      .from('communities')
      .insert({
        name: data.name,
        description: data.description,
        category: data.category,
        image_url: data.image_url,
        created_by: userId,
      })
      .select()
      .single();

    if (!error && newCommunity) {
      // Auto-join the creator to the community
      await supabase
        .from('community_members')
        .insert({ community_id: newCommunity.id, user_id: userId });
      await fetchCommunities();
    }

    return { data: newCommunity, error };
  };

  const joinCommunity = async (communityId: string) => {
    if (!userId) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
      .from('community_members')
      .insert({ community_id: communityId, user_id: userId });

    if (!error) {
      await fetchCommunities();
    }

    return { error };
  };

  const leaveCommunity = async (communityId: string) => {
    if (!userId) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (!error) {
      await fetchCommunities();
    }

    return { error };
  };

  return {
    communities,
    loading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    refreshCommunities: fetchCommunities,
  };
};

export const useCommunityPosts = (communityId: string, userId?: string) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!communityId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for the posts
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      // Use profiles_public view to exclude sensitive PII (phone, country, city)
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, name, avatar_url')
        .in('id', userIds);

      const profileMap: Record<string, { name: string; avatar_url: string | null }> = {};
      profiles?.forEach(p => {
        profileMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
      });

      const postsWithProfiles: CommunityPost[] = (data || []).map(p => ({
        ...p,
        profile: profileMap[p.user_id] || { name: 'Unknown', avatar_url: null },
      }));

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`community_posts_${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, fetchPosts]);

  const addPost = async (content: string) => {
    if (!userId || !communityId) return { error: { message: 'Not authenticated' } };

    const { error } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        user_id: userId,
        content,
      });

    return { error };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    return { error };
  };

  return {
    posts,
    loading,
    addPost,
    deletePost,
    refreshPosts: fetchPosts,
  };
};
