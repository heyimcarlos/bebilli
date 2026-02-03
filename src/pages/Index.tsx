import React, { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import ScannerOverlay from '@/components/ScannerOverlay';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import TimelinePage from '@/pages/TimelinePage';
import GroupPage from '@/pages/GroupPage';
import ProfilePage from '@/pages/ProfilePage';
import { useToast } from '@/hooks/use-toast';

const AppContent: React.FC = () => {
  const { user, setUser } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

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
  };

  const handleScanSuccess = (amount: number) => {
    toast({
      title: '🚀 Aporte registrado!',
      description: `Seu aporte de R$ ${amount.toFixed(2)} foi confirmado.`,
    });
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
      </>
    );
  }

  return (
    <>
      {activeTab === 'home' && <HomePage onGroupClick={handleGroupClick} />}
      {activeTab === 'timeline' && <TimelinePage />}
      {activeTab === 'profile' && <ProfilePage onLogout={() => setUser(null)} />}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
