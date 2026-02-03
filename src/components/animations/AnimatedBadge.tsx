import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Turtle, Crown, Flame, Star } from 'lucide-react';

interface AnimatedBadgeProps {
  type: 'rocket' | 'turtle' | 'crown' | 'flame' | 'star';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const badgeConfig = {
  rocket: {
    icon: Rocket,
    bg: 'bg-gradient-to-br from-primary to-accent',
    color: 'text-primary-foreground',
    glow: 'shadow-[0_0_20px_rgba(255,107,53,0.5)]',
  },
  turtle: {
    icon: Turtle,
    bg: 'bg-gradient-to-br from-muted to-muted-foreground/20',
    color: 'text-muted-foreground',
    glow: '',
  },
  crown: {
    icon: Crown,
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    color: 'text-yellow-900',
    glow: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]',
  },
  flame: {
    icon: Flame,
    bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    color: 'text-white',
    glow: 'shadow-[0_0_20px_rgba(255,87,34,0.5)]',
  },
  star: {
    icon: Star,
    bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    color: 'text-white',
    glow: 'shadow-[0_0_20px_rgba(156,39,176,0.5)]',
  },
};

const sizeConfig = {
  sm: { wrapper: 'w-6 h-6', icon: 'w-3 h-3' },
  md: { wrapper: 'w-8 h-8', icon: 'w-4 h-4' },
  lg: { wrapper: 'w-12 h-12', icon: 'w-6 h-6' },
};

const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({ 
  type, 
  size = 'md',
  animate = true 
}) => {
  const config = badgeConfig[type];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <motion.div
      className={`${sizes.wrapper} rounded-full ${config.bg} ${config.glow} flex items-center justify-center`}
      initial={animate ? { scale: 0, rotate: -180 } : undefined}
      animate={animate ? { 
        scale: 1, 
        rotate: 0,
      } : undefined}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <motion.div
        animate={animate && type === 'rocket' ? {
          y: [0, -2, 0],
        } : animate && type === 'flame' ? {
          scale: [1, 1.1, 1],
        } : animate && type === 'crown' ? {
          rotate: [0, 5, -5, 0],
        } : undefined}
        transition={{ 
          duration: type === 'flame' ? 0.5 : 1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Icon className={`${sizes.icon} ${config.color}`} />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedBadge;
