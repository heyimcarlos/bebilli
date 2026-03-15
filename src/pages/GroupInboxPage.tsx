import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGroupInbox, GroupConversation } from '@/hooks/useGroupInbox';
import { useAuthContext } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, Mic } from 'lucide-react';
import DefaultAvatar from '@/components/DefaultAvatar';

interface GroupInboxPageProps {
  onGroupClick: (groupId: string) => void;
  onGroupChatClick: (groupId: string) => void;
}

const GroupInboxPage: React.FC<GroupInboxPageProps> = ({ onGroupClick, onGroupChatClick }) => {
  const { user } = useAuthContext();
  const { t } = useApp();
  const { conversations, loading, refresh } = useGroupInbox(user?.id);
  const [navigatingGroupId, setNavigatingGroupId] = useState<string | null>(null);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getMessagePreview = (conv: GroupConversation) => {
    if (!conv.last_message) {
      return t('noMessagesYet') || 'No messages yet';
    }
    if (conv.last_message.audio_url) {
      return '🎤 Voice message';
    }
    return conv.last_message.content || '';
  };

  const handleChatClick = (groupId: string) => {
    setNavigatingGroupId(groupId);
    // Small delay to show the loading state before navigation
    setTimeout(() => {
      onGroupChatClick(groupId);
    }, 150);
  };

  console.log({ loading, conversations });

  // <div className="flex justify-center py-12">
  //   <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  // </div>
  // Show loading while fetching conversations OR while navigating to a chat
  if (loading || navigatingGroupId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('noConversations') || 'No conversations yet'}</h3>
        <p className="text-muted-foreground text-sm">
          {t('joinGroupToChat') || 'Join a group to start chatting with other members'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <motion.button
          key={conv.group_id}
          onClick={() => handleChatClick(conv.group_id)}
          className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
          whileTap={{ scale: 0.98 }}
        >
          {/* Group Avatar */}
          <div className="relative">
            <Avatar className="w-14 h-14">
              <AvatarImage src={conv.group_avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20">
                <DefaultAvatar name={conv.group_name} size={56} />
              </AvatarFallback>
            </Avatar>
            {conv.unread_count > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {conv.unread_count > 99 ? '99+' : conv.unread_count}
              </div>
            )}
          </div>

          {/* Conversation Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate">{conv.group_name}</h3>
              {conv.last_message && (
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {formatTime(conv.last_message.created_at)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {conv.last_message?.audio_url ? (
                <Mic className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <span className="text-sm text-muted-foreground">→ </span>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {conv.last_message && (
                  <span className="font-medium">{conv.last_message.user_name}: </span>
                )}
                {getMessagePreview(conv)}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default GroupInboxPage;
