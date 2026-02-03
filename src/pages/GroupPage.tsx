import React, { useState } from 'react';
import { ArrowLeft, Send, Bot, Lock, Check, Gift, Share2, Plus, DollarSign, Loader2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InviteModal from '@/components/InviteModal';
import QuickWinModal from '@/components/QuickWinModal';
import EditGroupModal from '@/components/EditGroupModal';
import { AnimatedBadge, AnimatedProgressBar, AnimatedCounter } from '@/components/animations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface GroupPageProps {
  groupId: string;
  onBack: () => void;
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const GroupPage: React.FC<GroupPageProps> = ({ groupId, onBack }) => {
  const { t, formatCurrency } = useApp();
  const { groups, profile, addContribution, refreshGroups, updateGroup, user } = useAuthContext();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; name: string; content: string; isBot?: boolean }>>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributing, setContributing] = useState(false);
  const [lastContribution, setLastContribution] = useState({ amount: 0, streak: 0 });

  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  const progress = group.goal_amount > 0 ? (group.current_amount / group.goal_amount) * 100 : 0;
  
  // Check if current user is admin
  const isAdmin = group.members.some(m => m.user_id === profile?.id && m.role === 'admin');

  const partners = [
    { name: 'Expedia', logo: '✈️', discount: '15% OFF', unlockAt: 25 },
    { name: 'Booking', logo: '🏨', discount: '20% OFF', unlockAt: 50 },
    { name: 'Airbnb', logo: '🏠', discount: '25% OFF', unlockAt: 75 },
    { name: 'Air Canada', logo: '🛫', discount: '30% OFF', unlockAt: 100 },
  ];

  const handleContribute = async () => {
    const amount = Number(contributionAmount);
    if (!amount || amount <= 0) return;

    setContributing(true);
    const { error } = await addContribution(groupId, amount);
    setContributing(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setShowContributeModal(false);
      setContributionAmount('');
      
      // Show celebration
      setLastContribution({ 
        amount, 
        streak: (profile?.current_streak || 0) + 1 
      });
      setShowWinModal(true);
      
      // Refresh groups to update progress
      await refreshGroups();
    }
  };

  const handleQuickContribute = async (amount: number) => {
    setContributing(true);
    const { error } = await addContribution(groupId, amount);
    setContributing(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setShowContributeModal(false);
      
      // Show celebration
      setLastContribution({ 
        amount, 
        streak: (profile?.current_streak || 0) + 1 
      });
      setShowWinModal(true);
      
      // Refresh groups to update progress
      await refreshGroups();
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      { id: Date.now().toString(), name: profile?.name || 'You', content: message },
    ]);
    setMessage('');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48">
          <img
            src={group.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        
        <div className="relative z-10 px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <motion.button
                  onClick={() => setShowEditModal(true)}
                  className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pencil className="w-5 h-5" />
                </motion.button>
              )}
              <motion.button
                onClick={() => setShowInviteModal(true)}
                className="w-10 h-10 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-5 h-5 text-primary-foreground" />
              </motion.button>
            </div>
          </div>
          
          <motion.h1 
            className="text-2xl font-bold mb-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {group.name}
          </motion.h1>
          {group.description && (
            <motion.p 
              className="text-muted-foreground text-sm mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {group.description}
            </motion.p>
          )}
          <motion.p 
            className="text-muted-foreground/70 text-xs"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {group.members.length} {t('members')}
          </motion.p>
        </div>
      </div>

      {/* Progress */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{t('groupGoal')}</span>
            <motion.span 
              className="text-sm font-semibold text-primary"
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              <AnimatedCounter value={progress} suffix="%" duration={1.5} className="font-semibold" /> {t('reached')}
            </motion.span>
          </div>
          <AnimatedProgressBar progress={progress} height={12} showMilestones />
          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-muted-foreground">{formatCurrency(group.current_amount)}</span>
            <span className="font-semibold">{formatCurrency(group.goal_amount)}</span>
          </div>
          
          {/* Your contribution */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('yourContribution')}</span>
              <span className="font-semibold text-success">{formatCurrency(group.user_contribution)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="w-full bg-secondary mb-4">
            <TabsTrigger value="ranking" className="flex-1">{t('ranking')}</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">{t('chat')}</TabsTrigger>
            <TabsTrigger value="dream" className="flex-1">{t('dreamPanel')}</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {group.members.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">{t('noMembersYet')}</p>
                </div>
              ) : (
                group.members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={item}
                    className={`glass-card p-4 flex items-center gap-4 ${member.user_id === profile?.id ? 'border-primary/50' : ''}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {index === 0 ? (
                      <AnimatedBadge type="rocket" size="md" />
                    ) : (
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {index + 1}
                      </motion.div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.profile.name}
                        {member.user_id === profile?.id && (
                          <span className="text-xs text-primary ml-2">{t('youUser')}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('yourContribution')}: {formatCurrency(member.total_contribution)}
                      </p>
                    </div>
                    
                    <motion.span 
                      className={`text-sm font-semibold ${index === 0 ? 'gradient-gold-text' : 'text-primary'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {formatCurrency(member.total_contribution)}
                    </motion.span>
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="glass-card p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
              {/* Bot welcome message */}
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                  <p className="text-xs text-primary font-medium mb-1">Bili Bot</p>
                  <p className="text-sm">{t('welcomeToGroup')} {group.name}! {t('startContributing')} 🚀</p>
                </div>
              </motion.div>
              
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    className="flex gap-3 justify-end"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-secondary"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  className="btn-primary text-primary-foreground w-12 h-12"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="dream" className="space-y-4">
            {/* Thermometer */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                {t('partners')}
              </h3>
              
              <div className="relative h-64 mb-6">
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-accent"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                </div>
                
                {/* Milestones */}
                {[25, 50, 75, 100].map((milestone, i) => (
                  <motion.div
                    key={milestone}
                    className="absolute left-1/2 -translate-x-1/2 flex items-center"
                    style={{ bottom: `${milestone - 5}%` }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <motion.div 
                      className={`w-4 h-4 rounded-full ${progress >= milestone ? 'bg-success' : 'bg-muted'} flex items-center justify-center`}
                      animate={progress >= milestone ? {
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(34, 197, 94, 0)',
                          '0 0 0 8px rgba(34, 197, 94, 0.3)',
                          '0 0 0 0 rgba(34, 197, 94, 0)',
                        ],
                      } : undefined}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {progress >= milestone && <Check className="w-3 h-3 text-success-foreground" />}
                    </motion.div>
                    <span className="ml-8 text-xs text-muted-foreground whitespace-nowrap">{milestone}%</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Partner Cards */}
            <motion.div 
              className="grid grid-cols-2 gap-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {partners.map((partner, i) => {
                const isUnlocked = progress >= partner.unlockAt;
                return (
                  <motion.button
                    key={partner.name}
                    variants={item}
                    disabled={!isUnlocked}
                    className={`glass-card p-4 text-center transition-all ${
                      isUnlocked
                        ? 'hover:border-primary/50 cursor-pointer'
                        : 'grayscale opacity-50 cursor-not-allowed'
                    }`}
                    whileHover={isUnlocked ? { scale: 1.05, y: -5 } : undefined}
                    whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                  >
                    <motion.div 
                      className="text-3xl mb-2"
                      animate={isUnlocked ? { 
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1],
                      } : undefined}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                    >
                      {partner.logo}
                    </motion.div>
                    <p className="font-medium text-sm">{partner.name}</p>
                    <p className={`text-xs ${isUnlocked ? 'text-success' : 'text-muted-foreground'}`}>
                      {partner.discount}
                    </p>
                    {!isUnlocked && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>{t('unlockAt')} {partner.unlockAt}%</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Contribute Button */}
      <motion.div
        className="fixed bottom-24 left-0 right-0 px-6 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => setShowContributeModal(true)}
          className="w-full h-14 btn-primary text-primary-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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
          <Plus className="w-5 h-5" />
          Add Contribution
        </motion.button>
      </motion.div>

      {/* Contribute Modal */}
      <Dialog open={showContributeModal} onOpenChange={setShowContributeModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Add Contribution
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Quick amounts */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick amounts</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => handleQuickContribute(amount)}
                    disabled={contributing}
                    className="flex-1 min-w-[60px] h-12 rounded-xl bg-secondary hover:bg-secondary/80 font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Or enter custom amount</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="bg-secondary"
                />
                <Button
                  onClick={handleContribute}
                  disabled={contributing || !contributionAmount}
                  className="btn-primary text-primary-foreground px-6"
                >
                  {contributing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupName={group.name}
        inviteCode={group.invite_code}
      />

      {/* Quick Win Modal */}
      <QuickWinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        amount={lastContribution.amount}
        newStreak={lastContribution.streak}
      />

      {/* Edit Group Modal (Admin only) */}
      {isAdmin && user && (
        <EditGroupModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          groupId={group.id}
          currentName={group.name}
          currentDescription={group.description}
          currentImageUrl={group.image_url}
          currentGoalAmount={group.goal_amount}
          userId={user.id}
          onSave={async (updates) => {
            const { error } = await updateGroup(group.id, updates);
            if (error) {
              toast({
                title: t('error'),
                description: error.message,
                variant: 'destructive',
              });
              return { error };
            }
            toast({
              title: '✅ ' + t('groupUpdated'),
              description: group.name,
            });
            return { error: null };
          }}
        />
      )}
    </motion.div>
  );
};

export default GroupPage;
