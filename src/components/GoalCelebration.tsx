import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfettiCelebration from '@/components/animations/ConfettiCelebration';
import { useApp } from '@/contexts/AppContext';

interface GoalCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
}

const GoalCelebration: React.FC<GoalCelebrationProps> = ({ isOpen, onClose, groupName }) => {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <>
      <ConfettiCelebration isActive={isOpen} duration={5000} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-card border border-border rounded-3xl overflow-hidden text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-8">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Trophy className="w-20 h-20 mx-auto text-white drop-shadow-lg" />
              </motion.div>
              <motion.div
                className="flex justify-center gap-4 mt-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <PartyPopper className="w-8 h-8 text-yellow-200" />
                <PartyPopper className="w-8 h-8 text-yellow-200 scale-x-[-1]" />
              </motion.div>
            </div>

            <div className="p-6">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black mb-2"
              >
                🎉 {t('goalAchieved')}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground mb-2"
              >
                {groupName}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-muted-foreground mb-6"
              >
                {t('goalAchievedDesc') || 'Your group reached 100% of the goal! Congratulations to all members! 🥳🎊'}
              </motion.p>
              <Button
                onClick={onClose}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl"
              >
                {t('celebrate') || 'Celebrate! 🎊'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default GoalCelebration;
