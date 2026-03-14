import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAllGroupChats, AllGroupChatMessage } from '@/hooks/useAllGroupChats';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Mic, Trash2, MessageCircle } from 'lucide-react';
import DefaultAvatar from '@/components/DefaultAvatar';
import AudioRecorder from '@/components/AudioRecorder';

interface GroupChatsPageProps {
  onGroupClick?: (groupId: string) => void;
}

const GroupChatsPage: React.FC<GroupChatsPageProps> = ({ onGroupClick }) => {
  const { user, profile } = useAuthContext();
  const { t } = useApp();
  const { messages, loading, sendMessage, uploadAudio, refresh } = useAllGroupChats(user?.id);
  const [message, setMessage] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set default selected group when messages load
  useEffect(() => {
    if (messages.length > 0 && !selectedGroupId) {
      setSelectedGroupId(messages[0].group_id);
    }
  }, [messages, selectedGroupId]);

  const handleSendMessage = async () => {
    if (!selectedGroupId || (!message.trim() && !pendingAudio)) return;

    setSending(true);
    try {
      let audioUrl: string | undefined;
      if (pendingAudio) {
        audioUrl = await uploadAudio(pendingAudio) || undefined;
        setPendingAudio(null);
      }

      await sendMessage(selectedGroupId, message, audioUrl);
      setMessage('');
      refresh();
    } finally {
      setSending(false);
    }
  };

  const handleAudioReady = (blob: Blob) => {
    setPendingAudio(blob);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Group messages by date for better organization
  const groupedMessages: { date: string; messages: AllGroupChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toLocaleDateString();
    const existingGroup = groupedMessages.find((g) => g.date === msgDate);
    if (existingGroup) {
      existingGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msgDate, messages: [msg] });
    }
  });

  // Get unique groups from messages for the selector
  const uniqueGroups = Array.from(
    new Map(messages.map((m) => [m.group_id, { id: m.group_id, name: m.group_name }])).values()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('noChats') || 'No chats yet'}</h3>
        <p className="text-muted-foreground text-sm">
          {t('noChatsDesc') || 'Join a group to start chatting with other members'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Group Selector */}
      {uniqueGroups.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto border-b border-border">
          {uniqueGroups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroupId === group.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroupId(group.id)}
              className="whitespace-nowrap text-xs"
            >
              {group.name}
            </Button>
          ))}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="text-center mb-4">
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {group.date === new Date().toLocaleDateString() 
                  ? 'Today' 
                  : group.date}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {group.messages.map((msg) => {
                const isOwn = msg.user_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    className={`flex gap-3 mb-4 ${isOwn ? 'justify-end' : ''}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={msg.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary p-0">
                          <DefaultAvatar name={msg.profile?.name || 'U'} size={32} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] ${isOwn ? 'text-right' : ''}`}>
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs text-muted-foreground">{msg.profile?.name}</p>
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {msg.group_name}
                          </span>
                        </div>
                      )}
                      {isOwn && selectedGroupId === msg.group_id && (
                        <p className="text-[10px] text-muted-foreground mb-0.5 text-right">
                          Replying to {msg.group_name}
                        </p>
                      )}
                      <div
                        className={`inline-block rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-secondary rounded-tl-sm'
                        }`}
                      >
                        {msg.content && <p className="text-sm px-4 py-2 whitespace-pre-wrap">{msg.content}</p>}
                        {msg.audio_url && (
                          <div className="px-3 py-2">
                            <audio src={msg.audio_url} controls className="h-8 max-w-[200px]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatTime(msg.created_at)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Audio Preview */}
      {pendingAudio && (
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-t border-border">
          <audio src={URL.createObjectURL(pendingAudio)} controls className="h-8 flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPendingAudio(null)}
            className="shrink-0 w-8 h-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 items-end">
          <AudioRecorder onAudioReady={handleAudioReady} disabled={sending} />
          <Input
            placeholder={t('typeMessage') || 'Type a message...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="bg-secondary"
            disabled={sending}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() && !pendingAudio || !selectedGroupId || sending}
              size="icon"
              className="btn-primary text-primary-foreground"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatsPage;
