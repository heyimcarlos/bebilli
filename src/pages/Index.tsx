import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import BottomNav from '@/components/BottomNav';
import LanguageCurrencyBar from '@/components/LanguageCurrencyBar';
import ScannerOverlay from '@/components/ScannerOverlay';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import HiddenGroupsDrawer from '@/components/HiddenGroupsDrawer';
import InstallPWA from '@/components/InstallPWA';
import WeeklySummaryModal from '@/components/WeeklySummaryModal';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import GroupPage from '@/pages/GroupPage';
import ProfilePage from '@/pages/ProfilePage';
import PremiumModal from '@/components/PremiumModal';
import VIPCard from '@/components/VIPCard';
import SideDrawer from '@/components/SideDrawer';
import UserSearchModal from '@/components/UserSearchModal';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useWeeklySummary } from '@/hooks/useWeeklySummary';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { ConfettiCelebration, MilestoneModal } from '@/components/animations';
import GoalCelebration from '@/components/GoalCelebration';
import { Loader2, Menu } from 'lucide-react';
import SupportFormModal from '@/components/SupportFormModal';

const AppContent: React.FC = () => {
  const { formatCurrency, t } = useApp();
  const { user, profile, groups, loading, signOut, addContribution } = useAuthContext();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const { requestPermission, sendMilestoneNotification, permission, isSupported } = usePushNotifications();
  const { summary, shouldShow: showWeeklySummary, markSummaryShown } = useWeeklySummary(user?.id);
  const { isPremium } = usePremiumCheck(user?.id);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHiddenGroups, setShowHiddenGroups] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showVIPPanel, setShowVIPPanel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [milestoneData, setMilestoneData] = useState<{
    show: boolean;
    milestone: number;
    groupName: string;
    reward?: string;
  }>({ show: false, milestone: 0, groupName: '' });
  const [goalCelebration, setGoalCelebration] = useState<{ show: boolean; groupName: string }>({ show: false, groupName: '' });
  const [showSupportForm, setShowSupportForm] = useState(false);

  const handlePremiumClick = () => {
    if (isPremium) {
      setShowVIPPanel(true);
    } else {
      setShowPremiumModal(true);
    }
  };

  useEffect(() => {
    if (user && isSupported && permission === 'default') {
      const timer = setTimeout(() => { requestPermission(); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, requestPermission]);

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
        if (milestone === 100) {
          setGoalCelebration({ show: true, groupName });
        } else {
          setShowConfetti(true);
          setMilestoneData({ show: true, milestone, groupName, reward: undefined });
        }
        const reward = milestone === 100 ? '🎉 All partners unlocked!' : undefined;
        sendMilestoneNotification(milestone, groupName, reward);
        return;
      }
    }
  };

  const handleScanSuccess = async (amount: number) => {
    const group = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : groups[0];
    if (group) {
      const oldProgress = (group.current_amount / group.goal_amount) * 100;
      const { error } = await addContribution(group.id, amount);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      const newProgress = ((group.current_amount + amount) / group.goal_amount) * 100;
      toast({ title: '🚀 Contribution recorded!', description: `Your contribution of ${formatCurrency(amount)} has been confirmed.` });
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
    setTimeout(() => { setShowScanner(false); }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (showScanner) {
    return (
      <AnimatePresence>
        <ScannerOverlay onClose={() => setShowScanner(false)} onSuccess={handleScanSuccess} />
      </AnimatePresence>
    );
  }

  if (selectedGroupId) {
    return (
      <>
        <GroupPage groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} onGroupClick={handleGroupClick} />
        <HiddenGroupsDrawer isOpen={showHiddenGroups} onClose={() => setShowHiddenGroups(false)} />
        <ConfettiCelebration isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <MilestoneModal isOpen={milestoneData.show} onClose={() => setMilestoneData(prev => ({ ...prev, show: false }))} milestone={milestoneData.milestone} groupName={milestoneData.groupName} reward={milestoneData.reward} />
        <GoalCelebration isOpen={goalCelebration.show} onClose={() => setGoalCelebration({ show: false, groupName: '' })} groupName={goalCelebration.groupName} />
      </>
    );
  }

  return (
    <>
      {/* Language/Currency selector bar */}
      <LanguageCurrencyBar />

      {/* Top bar: notification + hamburger */}
      <motion.div
        className="fixed top-14 right-4 z-50 flex items-center gap-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        <NotificationBell onClick={() => setShowNotifications(true)} />
        <motion.button
          onClick={() => setShowSideDrawer(true)}
          className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-4.5 h-4.5" />
        </motion.button>
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
          {activeTab === 'groups' && <HomePage onGroupClick={handleGroupClick} />}
          {activeTab === 'explore' && <ExplorePage />}
          {activeTab === 'profile' && <ProfilePage onLogout={() => signOut()} />}
        </motion.div>
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} onGroupClick={handleGroupClick} />
      <HiddenGroupsDrawer isOpen={showHiddenGroups} onClose={() => setShowHiddenGroups(false)} />
      <ConfettiCelebration isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <MilestoneModal isOpen={milestoneData.show} onClose={() => setMilestoneData(prev => ({ ...prev, show: false }))} milestone={milestoneData.milestone} groupName={milestoneData.groupName} reward={milestoneData.reward} />
      <GoalCelebration isOpen={goalCelebration.show} onClose={() => setGoalCelebration({ show: false, groupName: '' })} groupName={goalCelebration.groupName} />
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} reason="feature" />
      <WeeklySummaryModal isOpen={showWeeklySummary && !!summary} onClose={markSummaryShown} totalSaved={summary?.totalSavedThisWeek || 0} contributionCount={summary?.contributionCount || 0} topGroup={summary?.topGroup || null} groupProgress={summary?.groupProgress || []} formatCurrency={formatCurrency} />
      <InstallPWA />
      <SupportFormModal isOpen={showSupportForm} onClose={() => setShowSupportForm(false)} />
      <SideDrawer
        isOpen={showSideDrawer}
        onClose={() => setShowSideDrawer(false)}
        onProfile={() => setActiveTab('profile')}
        onPremium={handlePremiumClick}
        onHiddenGroups={() => setShowHiddenGroups(true)}
        onHelp={() => setShowSupportForm(true)}
        onSearch={() => setShowUserSearch(true)}
      />
      <UserSearchModal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} />
      {isPremium && <VIPCard isOpen={showVIPPanel} onClose={() => setShowVIPPanel(false)} />}
    </>
  );
};

const Index: React.FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);

export default Index;
