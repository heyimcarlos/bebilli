import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import billiLogo from '@/assets/billi-logo.png';
import { useApp } from '@/contexts/AppContext';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    name: string;
    avatar_url: string | null;
  };
}

interface PostRepliesProps {
  postId: string;
  userId?: string;
}

const PostReplies: React.FC<PostRepliesProps> = ({ postId, userId }) => {
  const { t } = useApp();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchReplies = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('post_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      // Fetch profiles
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, name, avatar_url')
        .in('id', userIds);

      const profileMap: Record<string, { name: string; avatar_url: string | null }> = {};
      profiles?.forEach(p => {
        if (p.id) profileMap[p.id] = { name: p.name || 'Unknown', avatar_url: p.avatar_url };
      });

      setReplies(data.map(r => ({
        ...r,
        profile: profileMap[r.user_id] || { name: 'Unknown', avatar_url: null }
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showReplies) {
      fetchReplies();
    }
  }, [postId, showReplies]);

  // Realtime subscription
  useEffect(() => {
    if (!showReplies) return;

    const channel = supabase
      .channel(`replies_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_replies',
          filter: `post_id=eq.${postId}`,
        },
        () => fetchReplies()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, showReplies]);

  const handleSendReply = async () => {
    if (!newReply.trim() || !userId || sending) return;

    setSending(true);
    const { error } = await supabase
      .from('post_replies')
      .insert({
        post_id: postId,
        user_id: userId,
        content: newReply.trim(),
      });

    if (!error) {
      setNewReply('');
    }
    setSending(false);
  };

  const handleDeleteReply = async (replyId: string) => {
    await supabase
      .from('post_replies')
      .delete()
      .eq('id', replyId);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMins < 1) return t('justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setShowReplies(!showReplies)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>{replies.length || ''} {t('replies') || 'Replies'}</span>
        {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pl-4 border-l-2 border-border"
          >
            {loading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {replies.map((reply) => (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reply.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary p-0.5">
                        <img src={billiLogo} alt="Avatar" className="w-full h-full object-contain" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{reply.profile.name}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(reply.created_at)}</span>
                        {reply.user_id === userId && (
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-foreground">{reply.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Reply input */}
                {userId && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder={t('writeReply') || 'Write a reply...'}
                      className="h-8 text-xs bg-secondary"
                      disabled={sending}
                    />
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={!newReply.trim() || sending}
                      className="h-8 w-8 p-0 btn-primary"
                    >
                      {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostReplies;
