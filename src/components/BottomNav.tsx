import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import BilliLogo from '@/components/BilliLogo';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useApp();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {/* Home */}
        <motion.button
          onClick={() => onTabChange('home')}
          className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={activeTab === 'home' ? { scale: [1, 1.2, 1] } : undefined} transition={{ duration: 0.3 }}>
            <Home className="w-6 h-6" />
          </motion.div>
          <span className="text-xs mt-1 font-medium">{t('home')}</span>
          <AnimatePresence>
            {activeTab === 'home' && (
              <motion.div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} layoutId="activeIndicator" />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Scan (center) */}
        <motion.button
          onClick={() => onTabChange('scan')}
          className="relative flex flex-col items-center justify-center -mt-8"
        >
          <motion.div 
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px hsl(var(--primary) / 0.3)',
                '0 0 40px hsl(var(--primary) / 0.5)',
                '0 0 20px hsl(var(--primary) / 0.3)',
              ],
            }}
            transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
          >
            <BilliLogo size={56} />
          </motion.div>
        </motion.button>

        {/* Explore */}
        <motion.button
          onClick={() => onTabChange('explore')}
          className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-colors ${
            activeTab === 'explore' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={activeTab === 'explore' ? { scale: [1, 1.2, 1] } : undefined} transition={{ duration: 0.3 }}>
            <Compass className="w-6 h-6" />
          </motion.div>
          <span className="text-xs mt-1 font-medium">{t('explore')}</span>
          <AnimatePresence>
            {activeTab === 'explore' && (
              <motion.div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} layoutId="activeIndicator" />
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
