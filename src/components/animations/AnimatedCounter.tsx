import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatFn?: (value: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
  formatFn,
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const startValue = displayValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (value - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formattedValue = formatFn 
    ? formatFn(displayValue) 
    : displayValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
