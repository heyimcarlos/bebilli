import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, Loader2, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useGroups } from '@/hooks/useGroups';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudioRecorder from '@/components/AudioRecorder';
import DefaultAvatar from '@/components/DefaultAvatar';

interface GroupChatViewProps {
  groupId: string;
  onBack: () => void;
  onViewGroupProfile?: (groupId: string) => void;
}

const GroupChatView: React.FC<GroupChatViewProps> = ({ groupId, onBack, onViewGroupProfile }) => {
  const { user, profile } = useAuthContext();
  const { t } = useApp();
  const { groups } = useGroups(user?.id);
  const { messages, loading, sendMessage, uploadAudio } = useGroupChat(groupId, user?.id);
  const [message, setMessage] = useState('');
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() && !pendingAudio) return;

    setSending(true);
    try {
      let audioUrl: string | undefined;
      if (pendingAudio) {
        audioUrl = (await uploadAudio(pendingAudio)) || undefined;
        setPendingAudio(null);
      }

      await sendMessage(message, audioUrl);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleAudioReady = (blob: Blob) => {
    setPendingAudio(blob);
    inputRef.current?.focus();
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return t('today') || 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday') || 'Yesterday';
    }
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = [];
  messages.forEach((msg) => {
    const date = getMessageDate(msg.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t('groupNotFound') || 'Group not found'}</p>
      </div>
    );
  }

  // Show full-screen loading while fetching messages
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header - WhatsApp style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center px-4 h-14 max-w-screen-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => onViewGroupProfile?.(groupId)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={(group as any).image_url || (group as any).cover_url || undefined} />
              <AvatarFallback className="bg-primary/20">
                <DefaultAvatar name={group.name} size={40} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">{group.name}</h2>
              <p className="text-xs text-muted-foreground">
                {group.members?.length || 0} {group.members?.length === 1 ? t('member') : t('members')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-14 pb-[120px] px-4 space-y-4">
        {/* Bot welcome message */}
        <div className="flex justify-center my-4">
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            {t('groupCreated') || 'Group created'}
          </span>
        </div>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
            <p className="text-xs text-primary font-medium mb-1">Bili Bot</p>
            <p className="text-sm">
              {t('welcomeToGroup') || 'Welcome to'} {group.name}! {t('startContributing') || 'Start contributing'} 🚀
            </p>
          </div>
        </motion.div>

        {groupedMessages.map((group) => (
              <div key={group.date} className="space-y-3">
                {/* Date separator */}
                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {group.messages.map((msg) => {
                    const isOwn = msg.user_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? 'justify-end' : ''}`}
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
                        <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                          {!isOwn && <p className="text-xs text-muted-foreground mb-0.5">{msg.profile?.name}</p>}
                          <div
                            className={`inline-block rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-secondary rounded-tl-sm'
                            }`}
                          >
                            {msg.content && (
                              <p className="text-sm px-4 py-2 whitespace-pre-wrap break-words">{msg.content}</p>
                            )}
                            {msg.audio_url && (
                              <div className="px-3 py-2">
                                <audio src={msg.audio_url} controls className="h-8 max-w-[200px]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 px-1">
                            {formatMessageTime(msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-screen-xl mx-auto p-3">
          {/* Audio preview */}
          {pendingAudio && (
            <div className="flex items-center gap-2 p-2 mb-2 rounded-xl bg-secondary/50 border border-border">
              <audio src={URL.createObjectURL(pendingAudio)} controls className="h-8 flex-1" />
              <Button variant="ghost" size="icon" onClick={() => setPendingAudio(null)} className="shrink-0 w-8 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <AudioRecorder onAudioReady={handleAudioReady} disabled={sending} />
            <Input
              ref={inputRef}
              placeholder={t('typeMessage') || 'Type a message...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-secondary min-h-[44px]"
              disabled={sending}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() && !pendingAudio}
                className="btn-primary text-primary-foreground w-12 h-11"
                size="icon"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>
        </div>
        {/* Safe area padding for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
};

export default GroupChatView;
