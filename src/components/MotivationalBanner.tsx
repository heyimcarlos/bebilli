import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Quote, ChevronRight } from 'lucide-react';

const motivationalQuotes = [
  { text: "Every dollar saved is a dollar earned!", emoji: "💰" },
  { text: "Your future self will thank you!", emoji: "🙏" },
  { text: "Small steps lead to big achievements!", emoji: "🚀" },
  { text: "Consistency beats intensity!", emoji: "🔥" },
  { text: "You're building wealth, one day at a time!", emoji: "🏗️" },
  { text: "Champions save before they spend!", emoji: "🏆" },
  { text: "Financial freedom is closer than you think!", emoji: "🌟" },
  { text: "Keep the streak alive!", emoji: "⚡" },
  { text: "Money saved is power stored!", emoji: "💪" },
  { text: "Be a billionaire in habits!", emoji: "👑" },
];

const MotivationalBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length);
        setIsVisible(true);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = motivationalQuotes[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl mb-4"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            ease: "linear",
            repeat: Infinity,
          }}
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      <div className="relative p-4 flex items-center gap-3">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="text-3xl"
        >
          {currentQuote.emoji}
        </motion.div>

        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 text-sm font-medium text-foreground"
            >
              {currentQuote.text}
            </motion.p>
          )}
        </AnimatePresence>

        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
    </motion.div>
  );
};

export default MotivationalBanner;
