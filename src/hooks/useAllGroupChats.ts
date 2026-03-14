import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useGroups } from './useGroups';

export interface AllGroupChatMessage {
  id: string;
  group_id: string;
  group_name: string;
  user_id: string;
  content: string | null;
  audio_url: string | null;
  created_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export const useAllGroupChats = (userId?: string) => {
  const { groups } = useGroups(userId);
  const [messages, setMessages] = useState<AllGroupChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!groups || groups.length === 0) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const groupIds = groups.map(g => g.id);
    
    // Fetch messages from all groups the user is a member of
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      // Fetch profiles for message authors
      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, name, avatar_url')
        .in('id', userIds);

      const profileMap = (profiles || []).reduce((acc, p) => {
        if (p.id) acc[p.id] = { name: p.name || 'Unknown', avatar_url: p.avatar_url };
        return acc;
      }, {} as Record<string, { name: string; avatar_url: string | null }>);

      // Create group ID to name map
      const groupNameMap = groups.reduce((acc, g) => {
        acc[g.id] = g.name;
        return acc;
      }, {} as Record<string, string>);

      const formattedMessages: AllGroupChatMessage[] = data.map(m => ({
        ...m,
        group_name: groupNameMap[m.group_id] || 'Unknown Group',
        profile: profileMap[m.user_id] || { name: 'Unknown', avatar_url: null },
      })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMessages(formattedMessages);
    }
    setLoading(false);
  }, [groups]);

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription for any new messages in user's groups
    if (groups && groups.length > 0) {
      channelRef.current = supabase
        .channel('all-group-chats')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        }, (payload) => {
          // Only add if the message is from one of our groups
          const groupIds = groups.map(g => g.id);
          if (groupIds.includes(payload.new.group_id)) {
            fetchMessages();
          }
        })
        .subscribe();

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    }
  }, [groups, fetchMessages]);

  const sendMessage = useCallback(async (groupId: string, content?: string, audioUrl?: string) => {
    if (!userId || (!content?.trim() && !audioUrl)) return { error: new Error('Empty message') };

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        content: content?.trim() || null,
        audio_url: audioUrl || null,
      });

    return { error };
  }, [userId]);

  const uploadAudio = useCallback(async (blob: Blob): Promise<string | null> => {
    if (!userId) return null;
    const fileName = `${userId}/${Date.now()}.webm`;
    const { error } = await supabase.storage
      .from('audio-messages')
      .upload(fileName, blob);

    if (error) return null;

    const { data } = supabase.storage
      .from('audio-messages')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }, [userId]);

  return { messages, loading, sendMessage, uploadAudio, refresh: fetchMessages };
};
