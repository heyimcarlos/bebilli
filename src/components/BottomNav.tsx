import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Scan, Compass } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import BilliLogo from '@/components/BilliLogo';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useApp();

  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'scan', icon: Scan, label: 'Scan', special: true },
    { id: 'explore', icon: Compass, label: t('explore') },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto relative">

        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-colors ${
              tab.special
                ? '-mt-8'
                : activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            whileHover={!tab.special ? { scale: 1.1 } : undefined}
            whileTap={!tab.special ? { scale: 0.95 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {tab.special ? (
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
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
              >
                <BilliLogo size={56} />
              </motion.div>
            ) : (
              <>
                <motion.div
                  animate={activeTab === tab.id ? {
                    scale: [1, 1.2, 1],
                  } : undefined}
                  transition={{ duration: 0.3 }}
                >
                  <tab.icon className="w-6 h-6" />
                </motion.div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <motion.div 
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      layoutId="activeIndicator"
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
