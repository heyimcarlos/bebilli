import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Compass, Activity } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useApp();

  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'groups', icon: Users, label: t('myGroups') },
    { id: 'feed', icon: Activity, label: 'Feed' },
    { id: 'explore', icon: Compass, label: t('explore') },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div animate={activeTab === tab.id ? { scale: [1, 1.2, 1] } : undefined} transition={{ duration: 0.3 }}>
              <tab.icon className="w-5 h-5" />
            </motion.div>
            <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            <AnimatePresence>
              {activeTab === tab.id && (
                <motion.div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
