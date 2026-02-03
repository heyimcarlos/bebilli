import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ConfettiCelebration, MilestoneModal } from '@/components/animations';

const AppContent: React.FC = () => {
  const { user, setUser, groups, formatCurrency, t } = useApp();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneData, setMilestoneData] = useState<{
    show: boolean;
    milestone: number;
    groupName: string;
    reward?: string;
  }>({ show: false, milestone: 0, groupName: '' });

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

  const checkMilestone = (oldProgress: number, newProgress: number, groupName: string) => {
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (oldProgress < milestone && newProgress >= milestone) {
        setShowConfetti(true);
        setMilestoneData({
          show: true,
          milestone,
          groupName,
          reward: milestone === 100 ? '🎉 Todos os parceiros desbloqueados!' : undefined,
        });
        return;
      }
    }
  };

  const handleScanSuccess = (amount: number) => {
    const group = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : groups[0];
    
    toast({
      title: '🚀 Aporte registrado!',
      description: `Seu aporte de ${formatCurrency(amount)} foi confirmado.`,
    });

    // Simulate sending notification to other group members
    if (group) {
      const oldProgress = (group.current / group.goal) * 100;
      const newProgress = ((group.current + amount) / group.goal) * 100;
      
      // Check for milestone achievements
      checkMilestone(oldProgress, newProgress, group.name);

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
      <AnimatePresence>
        <ScannerOverlay
          onClose={() => setShowScanner(false)}
          onSuccess={handleScanSuccess}
        />
      </AnimatePresence>
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
        <ConfettiCelebration 
          isActive={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />
        <MilestoneModal
          isOpen={milestoneData.show}
          onClose={() => setMilestoneData(prev => ({ ...prev, show: false }))}
          milestone={milestoneData.milestone}
          groupName={milestoneData.groupName}
          reward={milestoneData.reward}
        />
      </>
    );
  }

  return (
    <>
      {/* Floating Notification Bell */}
      <motion.div 
        className="fixed top-4 right-4 z-30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
      >
        <NotificationBell onClick={() => setShowNotifications(true)} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'profile' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'profile' ? -20 : 20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'home' && <HomePage onGroupClick={handleGroupClick} />}
          {activeTab === 'timeline' && <TimelinePage />}
          {activeTab === 'profile' && <ProfilePage onLogout={() => setUser(null)} />}
        </motion.div>
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onGroupClick={handleGroupClick}
      />

      <ConfettiCelebration 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      <MilestoneModal
        isOpen={milestoneData.show}
        onClose={() => setMilestoneData(prev => ({ ...prev, show: false }))}
        milestone={milestoneData.milestone}
        groupName={milestoneData.groupName}
        reward={milestoneData.reward}
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
