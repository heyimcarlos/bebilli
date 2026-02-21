import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupProgress {
  id: string;
  name: string;
  progress: number;
  weeklyAmount: number;
}

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalSaved: number;
  contributionCount: number;
  topGroup: GroupProgress | null;
  groupProgress: GroupProgress[];
  formatCurrency: (amount: number) => string;
}

const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  totalSaved,
  contributionCount,
  topGroup,
  groupProgress,
  formatCurrency,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden max-h-[85vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/50 flex items-center justify-center hover:bg-background/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <motion.div
              className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Calendar className="w-8 h-8 text-primary" />
            </motion.div>
            
            <h2 className="text-xl font-bold mb-1">Weekly Summary</h2>
            <p className="text-muted-foreground text-sm">Here's how you did this week!</p>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            {/* Total Saved */}
            <motion.div
              className="glass-card p-4 text-center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">You saved</span>
              </div>
              <p className="text-3xl font-bold gradient-text">{formatCurrency(totalSaved)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                from {contributionCount} contribution{contributionCount !== 1 ? 's' : ''}
              </p>
            </motion.div>

            {/* Top Group */}
            {topGroup && topGroup.weeklyAmount > 0 && (
              <motion.div
                className="glass-card p-4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Most Active Group</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{topGroup.name}</span>
                  <span className="text-sm text-primary font-semibold">
                    +{formatCurrency(topGroup.weeklyAmount)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Group Progress */}
            {groupProgress.length > 0 && (
              <motion.div
                className="glass-card p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Group Progress</span>
                </div>
                <div className="space-y-3">
                  {groupProgress.slice(0, 3).map((group) => (
                    <div key={group.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="truncate">{group.name}</span>
                        <span className="text-primary font-medium">{group.progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(group.progress, 100)}%` }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <Button
              onClick={onClose}
              className="w-full btn-primary text-primary-foreground"
            >
              Keep Saving! 🚀
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeeklySummaryModal;
