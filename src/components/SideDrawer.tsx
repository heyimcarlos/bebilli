import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Crown, EyeOff, HelpCircle, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfile: () => void;
  onPremium: () => void;
  onHiddenGroups: () => void;
  onHelp: () => void;
  onSearch: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onProfile,
  onPremium,
  onHiddenGroups,
  onHelp,
  onSearch,
}) => {
  const { t } = useApp();

  const items = [
    { icon: User, label: t('profile') || 'Profile', action: onProfile },
    { icon: Search, label: t('searchUsers') || 'Search Users', action: onSearch },
    { icon: Crown, label: 'VIP / Premium', action: onPremium, accent: true },
    { icon: EyeOff, label: t('hiddenGroups') || 'Hidden Groups', action: onHiddenGroups },
    { icon: HelpCircle, label: t('needHelp') || 'Help', action: onHelp },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-card border-l border-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-lg">{t('menu') || 'Menu'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {items.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { item.action(); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-secondary/80 ${
                    item.accent ? 'text-amber-500' : 'text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;
