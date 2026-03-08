import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, Lock, Check, Gift, Share2, Plus, Minus, DollarSign, Loader2, Pencil, Trash2, Users, UserPlus, Eye, EyeOff, Flame, Clock, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { validateContributionAmount } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InviteModal from '@/components/InviteModal';
import QuickWinModal from '@/components/QuickWinModal';
import EditGroupModal from '@/components/EditGroupModal';
import PartnerCoupons from '@/components/PartnerCoupons';
import GroupActionsMenu from '@/components/GroupActionsMenu';
import AudioRecorder from '@/components/AudioRecorder';
import DefaultAvatar from '@/components/DefaultAvatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGroupChat } from '@/hooks/useGroupChat';
import { AnimatedBadge, AnimatedProgressBar, AnimatedCounter, AnimatedLeaderboard, StreakDisplay } from '@/components/animations';
import ConsistencyRanking from '@/components/ConsistencyRanking';
import ReceiptValidationHistory from '@/components/ReceiptValidationHistory';
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

const QUICK_AMOUNTS_BY_CURRENCY: Record<string, number[]> = {
  CAD: [5, 10, 20, 50, 100],
  USD: [5, 10, 20, 50, 100],
  BRL: [10, 20, 50, 100, 200],
  EUR: [5, 10, 20, 50, 100],
};

const GroupPage: React.FC<GroupPageProps> = ({ groupId, onBack }) => {
  const { t, formatCurrency, currency } = useApp();
  const QUICK_AMOUNTS = QUICK_AMOUNTS_BY_CURRENCY[currency] || QUICK_AMOUNTS_BY_CURRENCY.CAD;
  const { groups, profile, addContribution, addWithdrawal, refreshGroups, updateGroup, leaveGroup, deleteGroup, hideGroup, user } = useAuthContext();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [contributing, setContributing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [lastContribution, setLastContribution] = useState({ amount: 0, streak: 0 });
  const [salaryInput, setSalaryInput] = useState('');
  const [showAmountToggle, setShowAmountToggle] = useState(true);

  const group = groups.find((g) => g.id === groupId);
  const { messages: chatMessages, loading: chatLoading, sendMessage: sendChatMessage, uploadAudio } = useGroupChat(groupId, user?.id);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!group) return null;

  const isOpenGoal = (group as any).is_open_goal || false;
  const competitionEndDate = (group as any).competition_end_date;
  const progress = !isOpenGoal && group.goal_amount > 0 ? (group.current_amount / group.goal_amount) * 100 : 0;
  
  // Current user's membership info
  const currentMembership = group.members.find(m => m.user_id === profile?.id);
  
  // Check if current user is admin
  const isAdmin = group.members.some(m => m.user_id === profile?.id && m.role === 'admin');
  
  // Check if shared group is pending (needs at least 2 members)
  const isSharedPending = (group as any).group_type === 'shared' && group.members.length < 2;

  const partners = [
    { name: 'Expedia', logo: '✈️', discount: '15% OFF', unlockAt: 25 },
    { name: 'Booking', logo: '🏨', discount: '20% OFF', unlockAt: 50 },
    { name: 'Airbnb', logo: '🏠', discount: '25% OFF', unlockAt: 75 },
    { name: 'Air Canada', logo: '🛫', discount: '30% OFF', unlockAt: 100 },
  ];

  const handleContribute = async () => {
    if (isSharedPending) {
      toast({ title: t('error'), description: t('sharedGroupDesc'), variant: 'destructive' });
      return;
    }
    const amount = validateContributionAmount(contributionAmount);
    if (amount === null) {
      toast({
        title: t('error'),
        description: t('invalidAmountError'),
        variant: 'destructive',
      });
      return;
    }

    setContributing(true);
    const { error } = await addContribution(groupId, amount);
    setContributing(false);

    if (error) {
      toast({
        title: t('error'),
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

  const handleWithdraw = async () => {
    const amount = validateContributionAmount(withdrawalAmount);
    if (amount === null) {
      toast({
        title: t('error'),
        description: t('invalidAmountError'),
        variant: 'destructive',
      });
      return;
    }

    if (amount > group.user_contribution) {
      toast({
        title: t('error'),
        description: t('insufficientBalance'),
        variant: 'destructive',
      });
      return;
    }

    setWithdrawing(true);
    const { error } = await addWithdrawal(groupId, amount);
    setWithdrawing(false);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setShowWithdrawModal(false);
      setWithdrawalAmount('');
      
      toast({
        title: '💸 ' + t('withdrawalSuccess'),
        description: `${formatCurrency(amount)} ${t('withdrawnFromGroup')}`,
      });
      
      await refreshGroups();
    }
  };

  const handleQuickWithdraw = async (amount: number) => {
    if (amount > group.user_contribution) {
      toast({
        title: t('error'),
        description: t('insufficientBalance'),
        variant: 'destructive',
      });
      return;
    }

    setWithdrawing(true);
    const { error } = await addWithdrawal(groupId, amount);
    setWithdrawing(false);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setShowWithdrawModal(false);
      
      toast({
        title: '💸 ' + t('withdrawalSuccess'),
        description: `${formatCurrency(amount)} ${t('withdrawnFromGroup')}`,
      });
      
      await refreshGroups();
    }
  };

  const handleQuickContribute = async (amount: number) => {
    setContributing(true);
    const { error } = await addContribution(groupId, amount);
    setContributing(false);

    if (error) {
      toast({
        title: t('error'),
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

  const handleSendMessage = async () => {
    if (!message.trim() && !pendingAudio) return;
    
    let audioUrl: string | null = null;
    if (pendingAudio) {
      audioUrl = await uploadAudio(pendingAudio);
      setPendingAudio(null);
    }
    
    await sendChatMessage(message.trim() || undefined, audioUrl || undefined);
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
              <GroupActionsMenu
                groupId={group.id}
                groupName={group.name}
                isAdmin={isAdmin}
                onHide={() => hideGroup(group.id)}
                onLeave={() => leaveGroup(group.id)}
                onDelete={() => deleteGroup(group.id)}
                onBack={onBack}
              />
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

      {/* Progress / Competition Stats */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="glass-card p-4">
          {isOpenGoal ? (
            <>
              {/* Competition Mode Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-foreground">{t('competitionMode') || 'Competition'}</span>
                </div>
                {competitionEndDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{t('endsOn') || 'Ends'}: {new Date(competitionEndDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 rounded-xl bg-secondary/50">
                  <p className="text-lg font-bold text-foreground">{group.members.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('members')}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-secondary/50">
                  <p className="text-lg font-bold text-primary">{formatCurrency(group.current_amount)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('totalSaved') || 'Total'}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-secondary/50">
                  <p className="text-lg font-bold text-foreground">
                    {currentMembership?.savings_percentage?.toFixed(1) || '0'}%
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('yourPercentage') || 'Your %'}</p>
                </div>
              </div>

              {/* Your contribution + visibility */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('yourContribution')}</span>
                  <span className="font-semibold text-success">{formatCurrency(group.user_contribution)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setShowSalaryModal(true)}
                    className="text-xs text-primary underline"
                  >
                    {currentMembership?.salary ? `${t('salary') || 'Salary'}: ${formatCurrency(currentMembership.salary)}` : (t('setSalary') || 'Set your salary')}
                  </button>
                  <button 
                    onClick={async () => {
                      if (!user || !currentMembership) return;
                      const newVal = !currentMembership.show_amount;
                      await supabase.from('group_memberships').update({ show_amount: newVal }).eq('id', currentMembership.id);
                      await refreshGroups();
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {currentMembership?.show_amount ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {currentMembership?.show_amount ? (t('amountVisible') || 'Visible') : (t('amountHidden') || 'Hidden')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
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
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('yourContribution')}</span>
                  <span className="font-semibold text-success">{formatCurrency(group.user_contribution)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Pending Shared Group Banner */}
      {isSharedPending && (
        <motion.div
          className="px-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground mb-1">{t('pendingBannerTitle')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t('pendingBannerDesc')}</p>
                <Button
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="rounded-full btn-primary text-primary-foreground font-semibold px-5 h-9"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  {t('inviteMembers')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="w-full bg-secondary mb-4 flex-wrap">
            <TabsTrigger value="ranking" className="flex-1">{t('ranking')}</TabsTrigger>
            <TabsTrigger value="consistency" className="flex-1">{t('consistency')}</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">{t('chat')}</TabsTrigger>
            <TabsTrigger value="receipts" className="flex-1">{t('receipts') || 'Receipts'}</TabsTrigger>
            <TabsTrigger value="dream" className="flex-1">{t('dreamPanel')}</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking">
            <AnimatedLeaderboard
              members={group.members}
              currentUserId={profile?.id}
              formatCurrency={formatCurrency}
              isOpenGoal={isOpenGoal}
            />
          </TabsContent>

          <TabsContent value="consistency">
            <ConsistencyRanking
              members={group.members}
              currentUserId={profile?.id}
            />
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
              
              {chatLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {chatMessages.map((msg) => {
                    const isOwn = msg.user_id === user?.id;
                    return (
                      <motion.div 
                        key={msg.id} 
                        className={`flex gap-3 ${isOwn ? 'justify-end' : ''}`}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        {!isOwn && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={msg.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary p-0">
                              <DefaultAvatar name={msg.profile?.name || 'U'} size={32} />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[80%] ${isOwn ? 'text-right' : ''}`}>
                          {!isOwn && (
                            <p className="text-xs text-muted-foreground mb-0.5">{msg.profile?.name}</p>
                          )}
                          <div className={`inline-block rounded-2xl ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : 'bg-secondary rounded-tl-sm'
                          }`}>
                            {msg.content && (
                              <p className="text-sm px-4 py-2">{msg.content}</p>
                            )}
                            {msg.audio_url && (
                              <div className="px-3 py-2">
                                <audio src={msg.audio_url} controls className="h-8 max-w-[200px]" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Audio preview */}
            {pendingAudio && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 border border-border">
                <audio src={URL.createObjectURL(pendingAudio)} controls className="h-8 flex-1" />
                <Button variant="ghost" size="icon" onClick={() => setPendingAudio(null)} className="shrink-0 w-8 h-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <AudioRecorder onAudioReady={(blob) => setPendingAudio(blob)} disabled={false} />
              <Input
                placeholder={t('typeMessage')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-secondary"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !pendingAudio}
                  className="btn-primary text-primary-foreground w-12 h-12"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            <ReceiptValidationHistory groupId={groupId} />
          </TabsContent>

          <TabsContent value="dream" className="space-y-4">
            {/* Partner Coupons Component */}
            <PartnerCoupons 
              userLevel={profile?.level || 1} 
              groupProgress={progress}
              isPremium={profile?.is_premium || false}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Contribute/Withdraw Buttons */}
      <motion.div
        className="fixed bottom-24 left-0 right-0 px-6 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-3">
          <motion.button
            onClick={() => setShowWithdrawModal(true)}
            disabled={group.user_contribution <= 0}
            className="flex-1 h-14 bg-secondary text-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: group.user_contribution > 0 ? 1.02 : 1 }}
            whileTap={{ scale: group.user_contribution > 0 ? 0.98 : 1 }}
          >
            <Minus className="w-5 h-5" />
            {t('withdraw')}
          </motion.button>
          <motion.button
            onClick={() => {
              if (isSharedPending) {
                setShowInviteModal(true);
              } else {
                setShowContributeModal(true);
              }
            }}
            className={`flex-[2] h-14 font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg ${isSharedPending ? 'bg-amber-500 text-white' : 'btn-primary text-primary-foreground'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isSharedPending ? {} : {
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
            {isSharedPending ? (
              <><UserPlus className="w-5 h-5" />{t('inviteMembers')}</>
            ) : (
              <><Plus className="w-5 h-5" />{t('addContribution')}</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Contribute Modal */}
      <Dialog open={showContributeModal} onOpenChange={setShowContributeModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-success" />
              {t('addContribution')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Quick amounts */}
            <div className="space-y-2">
               <p className="text-sm text-muted-foreground">{t('quickAmounts')}</p>
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
                    {formatCurrency(amount)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
               <p className="text-sm text-muted-foreground">{t('customAmount')}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                   placeholder={t('enterAmount')}
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
                    t('add') || 'Add'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-warning" />
              {t('withdraw')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Available balance */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">{t('availableBalance')}</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(group.user_contribution)}</p>
            </div>

            {/* Quick amounts */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('quickAmounts')}</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.filter(amount => amount <= group.user_contribution).map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => handleQuickWithdraw(amount)}
                    disabled={withdrawing}
                    className="flex-1 min-w-[60px] h-12 rounded-xl bg-secondary hover:bg-secondary/80 font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {formatCurrency(amount)}
                  </motion.button>
                ))}
                {group.user_contribution > 0 && (
                  <motion.button
                    onClick={() => handleQuickWithdraw(group.user_contribution)}
                    disabled={withdrawing}
                    className="flex-1 min-w-[60px] h-12 rounded-xl bg-warning/20 hover:bg-warning/30 text-warning font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('withdrawAll')}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('customAmount')}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t('enterAmount')}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  max={group.user_contribution}
                  className="bg-secondary"
                />
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) > group.user_contribution}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground px-6"
                >
                  {withdrawing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('withdraw') || 'Withdraw'
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t('withdrawWarning')}
            </p>
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

      {/* Salary Settings Modal */}
      <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {t('setSalary') || 'Set Your Salary'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t('salaryDesc') || 'Your salary is used to calculate savings percentage for the competition ranking. It stays private.'}
            </p>
            <Input
              type="number"
              placeholder={t('monthlySalary') || 'Monthly salary'}
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="bg-secondary"
            />
            <Button
              onClick={async () => {
                if (!currentMembership || !salaryInput) return;
                const salary = parseFloat(salaryInput);
                if (salary <= 0) return;
                await supabase.from('group_memberships').update({ salary }).eq('id', currentMembership.id);
                await refreshGroups();
                setShowSalaryModal(false);
                setSalaryInput('');
                toast({ title: '✅', description: t('salaryUpdated') || 'Salary updated!' });
              }}
              disabled={!salaryInput || parseFloat(salaryInput) <= 0}
              className="w-full btn-primary text-primary-foreground"
            >
              {t('save') || 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default GroupPage;
