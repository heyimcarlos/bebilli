import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import BottomNav from '@/components/BottomNav';
import ScannerOverlay from '@/components/ScannerOverlay';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import InstallPWA from '@/components/InstallPWA';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import TimelinePage from '@/pages/TimelinePage';
import GroupPage from '@/pages/GroupPage';
import ProfilePage from '@/pages/ProfilePage';
import { useToast } from '@/hooks/use-toast';
import { ConfettiCelebration, MilestoneModal } from '@/components/animations';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { formatCurrency, t } = useApp();
  const { user, profile, groups, loading, signOut, addContribution } = useAuthContext();
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
          reward: milestone === 100 ? '🎉 All partners unlocked!' : undefined,
        });
        return;
      }
    }
  };

  const handleScanSuccess = async (amount: number) => {
    const group = selectedGroupId 
      ? groups.find(g => g.id === selectedGroupId) 
      : groups[0];
    
    if (group) {
      const oldProgress = (group.current_amount / group.goal_amount) * 100;
      
      // Add contribution to database
      const { error } = await addContribution(group.id, amount);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const newProgress = ((group.current_amount + amount) / group.goal_amount) * 100;
      
      toast({
        title: '🚀 Contribution recorded!',
        description: `Your contribution of ${formatCurrency(amount)} has been confirmed.`,
      });

      // Check for milestone achievements
      checkMilestone(oldProgress, newProgress, group.name);

      addNotification({
        type: 'contribution',
        title: `${t('newContribution')} 💰`,
        message: `${profile?.name || 'You'} ${t('contributedTo')} ${group.name}: ${formatCurrency(amount)}`,
        groupId: group.id,
        groupName: group.name,
        userName: profile?.name,
        amount,
      });
    }

    setTimeout(() => {
      setShowScanner(false);
    }, 1000);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />;
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
          {activeTab === 'timeline' && <TimelinePage onGroupClick={handleGroupClick} />}
          {activeTab === 'profile' && <ProfilePage onLogout={() => signOut()} />}
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

      {/* PWA Install Banner */}
      <InstallPWA />
    </>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </AppProvider>
  );
};

export default Index;
