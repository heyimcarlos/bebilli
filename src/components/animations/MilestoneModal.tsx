import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Rocket, Target, Sparkles, Gift, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: number;
  groupName: string;
  reward?: string;
}

const milestoneConfig = {
  25: { icon: Star, color: '#00D4AA', title: 'Primeiro Marco!' },
  50: { icon: Target, color: '#FFD700', title: 'Metade do Caminho!' },
  75: { icon: Rocket, color: '#FF6B35', title: 'Quase Lá!' },
  100: { icon: Trophy, color: '#FF4081', title: 'Meta Conquistada!' },
};

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  milestone,
  groupName,
  reward,
}) => {
  const { t } = useApp();
  const config = milestoneConfig[milestone as keyof typeof milestoneConfig] || milestoneConfig[25];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-6 pointer-events-none"
          >
            <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full pointer-events-auto text-center relative overflow-hidden">
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${config.color}40, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                  initial={{ 
                    x: '50%', 
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${30 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                    y: `${30 + Math.sin(i * 60 * Math.PI / 180) * 30}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}

              {/* Icon */}
              <motion.div
                className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, damping: 15 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Icon className="w-12 h-12" style={{ color: config.color }} />
                </motion.div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <motion.h2
                  className="text-3xl font-black mb-2"
                  style={{ color: config.color }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  {milestone}%
                </motion.h2>
                <h3 className="text-xl font-bold mb-2">{config.title}</h3>
                <p className="text-muted-foreground mb-4">{groupName}</p>

                {reward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-primary/10 rounded-xl p-3 mb-4 flex items-center justify-center gap-2"
                  >
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{reward}</span>
                  </motion.div>
                )}

                <motion.button
                  onClick={onClose}
                  className="btn-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  {t('continue') || 'Continuar'}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MilestoneModal;
