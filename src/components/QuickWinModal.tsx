import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame, Star, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  newStreak: number;
  message?: string;
}

const celebrationMessages = [
  "You're crushing it! 💪",
  "Another step to millions! 🚀",
  "Billionaire moves! 👑",
  "Your future self says thanks! 🙏",
  "Keep that momentum going! ⚡",
];

const QuickWinModal: React.FC<QuickWinModalProps> = ({
  isOpen,
  onClose,
  amount,
  newStreak,
  message,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate celebration particles
      const emojis = ['💰', '⭐', '🎉', '✨', '💎', '🔥', '🚀'];
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  const randomMessage = message || celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: `${particle.x}vw`,
                y: '50vh'
              }}
              animate={{ 
                opacity: 0,
                scale: 1,
                y: `${particle.y - 50}vh`,
              }}
              transition={{ 
                duration: 2,
                ease: "easeOut",
                delay: Math.random() * 0.5
              }}
              className="fixed text-2xl pointer-events-none"
            >
              {particle.emoji}
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
            className="glass-card p-8 max-w-sm mx-4 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse" />
            
            <div className="relative z-10">
              {/* Trophy animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                >
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold gradient-text mb-2"
              >
                +${amount.toFixed(2)}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-foreground font-semibold mb-4"
              >
                {randomMessage}
              </motion.p>

              {/* Streak indicator */}
              {newStreak > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/30 mb-4"
                >
                  <Flame className="w-5 h-5 text-destructive" />
                  <span className="font-bold text-destructive">{newStreak} day streak!</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full btn-primary text-primary-foreground font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Keep Going!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickWinModal;
