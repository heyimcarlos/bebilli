import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ContributionSuccessProps {
  isVisible: boolean;
  amount: number;
  onComplete: () => void;
}

const ContributionSuccess: React.FC<ContributionSuccessProps> = ({
  isVisible,
  amount,
  onComplete,
}) => {
  const { formatCurrency, t } = useApp();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 15,
              stiffness: 200,
            }}
            className="bg-card border border-success/30 rounded-3xl p-8 text-center relative overflow-hidden"
          >
            {/* Success ripple effect */}
            <motion.div
              className="absolute inset-0 bg-success/10 rounded-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            />

            {/* Check icon */}
            <motion.div
              className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-full bg-success flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Check className="w-10 h-10 text-success-foreground" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Amount */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-success font-medium">{t('aiDetected')}</span>
              </div>
              
              <motion.p
                className="text-4xl font-black gradient-text mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                {formatCurrency(amount)}
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-2 text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">{t('rankingUpdated')}</span>
              </motion.div>
            </motion.div>

            {/* Floating coins */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-yellow-900"
                initial={{ 
                  x: '50%', 
                  y: '100%',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  y: [100, -50],
                  x: [0, (i - 2) * 40],
                  scale: [0, 1, 0],
                  rotate: 360,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.3 + i * 0.1,
                  ease: 'easeOut',
                }}
                style={{ left: '50%' }}
              >
                $
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContributionSuccess;
