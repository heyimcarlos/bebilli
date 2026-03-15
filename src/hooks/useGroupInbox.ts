import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useGroups } from './useGroups';

export interface GroupConversation {
  group_id: string;
  group_name: string;
  group_avatar_url: string | null;
  last_message: {
    id: string;
    content: string | null;
    audio_url: string | null;
    created_at: string;
    user_name: string;
  } | null;
  unread_count: number;
}

export const useGroupInbox = (userId?: string) => {
  const { groups } = useGroups(userId);
  const [conversations, setConversations] = useState<GroupConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!groups || groups.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const groupIds = groups.map(g => g.id);

    // Get last message for each group using a window function approach
    // First, get the last message ID per group
    const { data: lastMessages, error } = await supabase
      .from('chat_messages')
      .select('id, group_id, content, audio_url, created_at, user_id')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Get unique last message per group
    const lastMessageByGroup = new Map<string, typeof lastMessages[0]>();
    lastMessages?.forEach((msg) => {
      if (!lastMessageByGroup.has(msg.group_id)) {
        lastMessageByGroup.set(msg.group_id, msg);
      }
    });

    // Get profiles for message authors
    const userIds = [...new Set(Array.from(lastMessageByGroup.values()).map(m => m.user_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from('profiles_public')
      .select('id, name')
      .in('id', userIds);

    const profileMap = (profiles || []).reduce((acc, p) => {
      if (p.id) acc[p.id] = p.name || 'Unknown';
      return acc;
    }, {} as Record<string, string>);

    // Build conversations list
    const conversationsList: GroupConversation[] = groups.map(group => {
      const lastMsg = lastMessageByGroup.get(group.id);
      return {
        group_id: group.id,
        group_name: group.name,
        group_avatar_url: (group as any).image_url || (group as any).cover_url,
        last_message: lastMsg ? {
          id: lastMsg.id,
          content: lastMsg.content,
          audio_url: lastMsg.audio_url,
          created_at: lastMsg.created_at,
          user_name: profileMap[lastMsg.user_id] || 'Unknown',
        } : null,
        unread_count: 0, // TODO: Implement unread tracking with backend support
      };
    });

    // Sort by most recent message
    conversationsList.sort((a, b) => {
      if (!a.last_message) return 1;
      if (!b.last_message) return -1;
      return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
    });

    setConversations(conversationsList);
    setLoading(false);
  }, [groups]);

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription
    if (groups && groups.length > 0) {
      channelRef.current = supabase
        .channel('group-inbox')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    }
  }, [groups, fetchConversations]);

  return { conversations, loading, refresh: fetchConversations };
};
