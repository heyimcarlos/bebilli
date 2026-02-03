import React, { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import BottomNav from '@/components/BottomNav';
import ScannerOverlay from '@/components/ScannerOverlay';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import TimelinePage from '@/pages/TimelinePage';
import GroupPage from '@/pages/GroupPage';
import ProfilePage from '@/pages/ProfilePage';
import { useToast } from '@/hooks/use-toast';

const AppContent: React.FC = () => {
  const { user, setUser, groups, formatCurrency, t } = useApp();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'scan') {
      setShowScanner(true);
    } else {
      setActiveTab(tab);
      setSelectedGroupId(null);
    }
  };

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowNotifications(false);
  };

  const handleScanSuccess = (amount: number) => {
    const group = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : groups[0];
    
    toast({
      title: '🚀 Aporte registrado!',
      description: `Seu aporte de ${formatCurrency(amount)} foi confirmado.`,
    });

    // Simulate sending notification to other group members
    if (group) {
      addNotification({
        type: 'contribution',
        title: `${t('newContribution')} 💰`,
        message: `${user?.name || 'Você'} ${t('contributedTo')} ${group.name}: ${formatCurrency(amount)}`,
        groupId: group.id,
        groupName: group.name,
        userName: user?.name,
        amount,
      });
    }

    setTimeout(() => {
      setShowScanner(false);
    }, 1000);
  };

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  if (showScanner) {
    return (
      <ScannerOverlay
        onClose={() => setShowScanner(false)}
        onSuccess={handleScanSuccess}
      />
    );
  }

  if (selectedGroupId) {
    return (
      <>
        <GroupPage
          groupId={selectedGroupId}
          onBack={() => setSelectedGroupId(null)}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onGroupClick={handleGroupClick}
        />
      </>
    );
  }

  return (
    <>
      {/* Floating Notification Bell */}
      <div className="fixed top-4 right-4 z-30">
        <NotificationBell onClick={() => setShowNotifications(true)} />
      </div>

      {activeTab === 'home' && <HomePage onGroupClick={handleGroupClick} />}
      {activeTab === 'timeline' && <TimelinePage />}
      {activeTab === 'profile' && <ProfilePage onLogout={() => setUser(null)} />}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onGroupClick={handleGroupClick}
      />
    </>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AppProvider>
  );
};

export default Index;
