import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, MessageCircle, LogOut, Loader2, Trash2 } from 'lucide-react';
import { useCommunityPosts, Community } from '@/hooks/useCommunities';
import { useAuthContext } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import billiLogo from '@/assets/billi-logo.png';
import PostReactions from '@/components/PostReactions';

interface CommunityDetailPageProps {
  community: Community;
  onBack: () => void;
  onLeave: () => void;
}

const CommunityDetailPage: React.FC<CommunityDetailPageProps> = ({
  community,
  onBack,
  onLeave,
}) => {
  const { user } = useAuthContext();
  const { t } = useApp();
  const { posts, loading, addPost, deletePost } = useCommunityPosts(community.id, user?.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const { error } = await addPost(newMessage.trim());
    
    if (!error) {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative">
        <div className="h-32 overflow-hidden">
          <img
            src={community.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-background/50 backdrop-blur-sm hover:bg-background/70"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
            className="bg-background/50 backdrop-blur-sm hover:bg-destructive/80 hover:text-destructive-foreground text-destructive"
          >
            <LogOut className="w-4 h-4 mr-1" />
            {t('leave') || 'Leave'}
          </Button>
        </div>

        <div className="px-6 -mt-8 relative">
          <h1 className="text-xl font-bold">{community.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{community.members_count} {t('members')}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{posts.length} {t('posts') || 'posts'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">{t('noPostsYet') || 'No posts yet'}</h3>
            <p className="text-sm text-muted-foreground">
              {t('beFirstToPost') || 'Be the first to share a tip!'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post) => {
              const isOwn = post.user_id === user?.id;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={post.profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary p-1">
                      <img src={billiLogo} alt="Avatar" className="w-full h-full object-contain" />
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 max-w-[80%] ${isOwn ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwn && (
                        <span className="text-sm font-medium">{post.profile.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(post.created_at)}
                      </span>
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-secondary rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                    <PostReactions postId={post.id} userId={user?.id} isOwn={isOwn} postOwnerId={post.user_id} postOwnerName={post.profile.name} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('shareATip') || 'Share a tip...'}
            className="flex-1 bg-secondary"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="btn-primary"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
