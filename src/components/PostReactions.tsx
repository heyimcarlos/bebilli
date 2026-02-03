import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface PostReactionsProps {
  postId: string;
  userId?: string;
  isOwn?: boolean;
}

const AVAILABLE_EMOJIS = ['👍', '❤️', '🔥', '💡', '👏'];

const PostReactions: React.FC<PostReactionsProps> = ({ postId, userId, isOwn }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);

    if (data) {
      const reactionMap = new Map<string, { count: number; hasReacted: boolean }>();
      
      data.forEach((r) => {
        const existing = reactionMap.get(r.emoji) || { count: 0, hasReacted: false };
        reactionMap.set(r.emoji, {
          count: existing.count + 1,
          hasReacted: existing.hasReacted || r.user_id === userId,
        });
      });

      const reactionsArray: Reaction[] = [];
      reactionMap.forEach((value, emoji) => {
        reactionsArray.push({ emoji, ...value });
      });

      setReactions(reactionsArray.sort((a, b) => b.count - a.count));
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [postId, userId]);

  const toggleReaction = async (emoji: string) => {
    if (!userId || loading) return;

    setLoading(true);
    const existingReaction = reactions.find(r => r.emoji === emoji && r.hasReacted);

    if (existingReaction) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('emoji', emoji);
    } else {
      await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: userId, emoji });
    }

    await fetchReactions();
    setLoading(false);
    setShowPicker(false);
  };

  return (
    <div className={cn("flex items-center gap-1 mt-1 flex-wrap", isOwn ? "justify-end" : "justify-start")}>
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleReaction(reaction.emoji)}
          disabled={loading || !userId}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
            reaction.hasReacted
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary hover:bg-secondary/80 border border-transparent"
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </motion.button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPicker(!showPicker)}
          className="w-6 h-6 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          disabled={!userId}
        >
          <Smile className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>

        {/* Emoji picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className={cn(
                "absolute z-50 flex gap-1 p-2 bg-card border border-border rounded-full shadow-lg",
                isOwn ? "right-0" : "left-0",
                "bottom-full mb-2"
              )}
            >
              {AVAILABLE_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleReaction(emoji)}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-secondary rounded-full transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostReactions;
