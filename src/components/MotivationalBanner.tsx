import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

const MotivationalBanner: React.FC = () => {
  const { t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  const quotes = [
    { textKey: 'everyDollarSaved', emoji: '💰' },
    { textKey: 'futureThankYouQuote', emoji: '🙏' },
    { textKey: 'smallStepsQuote', emoji: '👟' },
    { textKey: 'consistencyQuote', emoji: '🔥' },
    { textKey: 'buildingWealthQuote', emoji: '🏗️' },
    { textKey: 'championsQuote', emoji: '🏆' },
    { textKey: 'financialFreedomQuote', emoji: '🗝️' },
    { textKey: 'keepStreakQuote', emoji: '⚡' },
    { textKey: 'moneyPowerQuote', emoji: '💪' },
    { textKey: 'beABillionaireQuote', emoji: '👑' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const current = quotes[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-xl mb-4 p-3.5 bg-secondary/50 border border-border/50 overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <motion.span 
          key={currentIndex}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl shrink-0"
        >
          {current.emoji}
        </motion.span>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-medium text-muted-foreground leading-relaxed"
          >
            {t(current.textKey)}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MotivationalBanner;
