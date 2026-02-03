import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressBarProps {
  progress: number;
  height?: number;
  showMilestones?: boolean;
  animated?: boolean;
}

const milestones = [25, 50, 75, 100];

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 12,
  showMilestones = true,
  animated = true,
}) => {
  return (
    <div className="relative w-full">
      {/* Background */}
      <div 
        className="w-full bg-secondary rounded-full overflow-hidden"
        style={{ height }}
      >
        {/* Progress fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full relative"
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ 
            duration: 1.5, 
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </motion.div>
      </div>

      {/* Milestones */}
      {showMilestones && (
        <div className="absolute inset-0 flex items-center">
          {milestones.map((milestone) => (
            <motion.div
              key={milestone}
              className="absolute"
              style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: milestone * 0.01 }}
            >
              <motion.div
                className={`w-3 h-3 rounded-full border-2 ${
                  progress >= milestone 
                    ? 'bg-primary border-primary' 
                    : 'bg-background border-muted-foreground/30'
                }`}
                animate={progress >= milestone ? {
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(255,107,53,0)',
                    '0 0 0 8px rgba(255,107,53,0.3)',
                    '0 0 0 0 rgba(255,107,53,0)',
                  ],
                } : undefined}
                transition={{ 
                  duration: 1,
                  repeat: progress >= milestone ? Infinity : 0,
                  repeatDelay: 2,
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar;
