import React from 'react';
import { Home, Users, User, Scan } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useApp();

  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'timeline', icon: Users, label: t('timeline') },
    { id: 'scan', icon: Scan, label: 'Scan', special: true },
    { id: 'profile', icon: User, label: t('profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 ${
              tab.special
                ? 'relative -mt-8'
                : activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.special ? (
              <div className="w-14 h-14 rounded-full btn-primary flex items-center justify-center glow-primary animate-pulse-glow">
                <tab.icon className="w-6 h-6 text-primary-foreground" />
              </div>
            ) : (
              <>
                <tab.icon
                  className={`w-6 h-6 transition-transform duration-300 ${
                    activeTab === tab.id ? 'scale-110' : ''
                  }`}
                />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
