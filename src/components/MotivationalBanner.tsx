import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CoinIcon, RocketIcon, FireIcon, TrophyIcon, HeartIcon, StarIcon, ThumbsUpIcon, PiggyBankIcon } from '@/components/BilliIcons';

const MotivationalBanner: React.FC = () => {
  const { t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Quote definitions using translation keys
  const getQuotes = () => [
    { textKey: 'everyDollarSaved', Icon: CoinIcon },
    { textKey: 'futureThankYouQuote', Icon: ThumbsUpIcon },
    { textKey: 'smallStepsQuote', Icon: RocketIcon },
    { textKey: 'consistencyQuote', Icon: FireIcon },
    { textKey: 'buildingWealthQuote', Icon: PiggyBankIcon },
    { textKey: 'championsQuote', Icon: TrophyIcon },
    { textKey: 'financialFreedomQuote', Icon: StarIcon },
    { textKey: 'keepStreakQuote', Icon: FireIcon },
    { textKey: 'moneyPowerQuote', Icon: HeartIcon },
    { textKey: 'beABillionaireQuote', Icon: TrophyIcon },
  ];

  const quotes = getQuotes();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[currentIndex];

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
          className="w-10 h-10 flex-shrink-0"
        >
          <currentQuote.Icon className="w-10 h-10" />
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
              {t(currentQuote.textKey)}
            </motion.p>
          )}
        </AnimatePresence>

        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
    </motion.div>
  );
};

export default MotivationalBanner;
