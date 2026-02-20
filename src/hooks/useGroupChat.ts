import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string | null;
  audio_url: string | null;
  created_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export const useGroupChat = (groupId: string, userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

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

      setMessages(data.map(m => ({
        ...m,
        profile: profileMap[m.user_id] || { name: 'Unknown', avatar_url: null },
      })));
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchMessages();

    channelRef.current = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `group_id=eq.${groupId}`,
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [groupId, fetchMessages]);

  const sendMessage = useCallback(async (content?: string, audioUrl?: string) => {
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
  }, [groupId, userId]);

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

  return { messages, loading, sendMessage, uploadAudio };
};
