import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Plus, Hash, TrendingUp, Loader2, ImagePlus, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import EnhancedGroupCard from '@/components/EnhancedGroupCard';
import UserStatsCard from '@/components/UserStatsCard';
import MotivationalBanner from '@/components/MotivationalBanner';
import DailyChallenge from '@/components/DailyChallenge';
import { Button } from '@/components/ui/button';
import billiLogo from '@/assets/billi-logo.png';
import JoinGroupModal from '@/components/JoinGroupModal';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface HomePageProps {
  onGroupClick: (groupId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGroupClick }) => {
  const { formatCurrency, t } = useApp();
  const { user, profile, groups, groupsLoading, createGroup, joinGroupByCode } = useAuthContext();
  const { toast } = useToast();
  const { uploadGroupImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [initialCode, setInitialCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', goal: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check for invite code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setInitialCode(code.toUpperCase());
      setJoinModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const totalBalance = groups.reduce((sum, g) => sum + g.current_amount, 0);

  // Check if user contributed today
  const hasContributedToday = profile?.last_contribution_at 
    ? new Date(profile.last_contribution_at).toDateString() === new Date().toDateString()
    : false;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.goal || !user) return;
    
    setCreating(true);
    
    let imageUrl: string | undefined;
    
    if (selectedImage) {
      const uploadedUrl = await uploadGroupImage(selectedImage, user.id);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const { error } = await createGroup(newGroup.name, Number(newGroup.goal), imageUrl);
    setCreating(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '🎉 Group created!',
        description: `${newGroup.name} is ready to receive contributions.`,
      });
      setCreateModalOpen(false);
      setNewGroup({ name: '', goal: '' });
      clearImage();
    }
  };

  const handleJoinGroup = async (code: string) => {
    const { data, error } = await joinGroupByCode(code);
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: '🎉 ' + t('joinedGroup'),
      description: `You joined ${data.name}!`,
    });
    setJoinModalOpen(false);
    setInitialCode('');
    if (data) {
      onGroupClick(data.id);
    }
    return true;
  };

  const handleDailyChallengeContribute = () => {
    if (groups.length > 0) {
      onGroupClick(groups[0].id);
    }
  };

  // Sort groups by progress for ranking
  const sortedGroups = [...groups].sort((a, b) => {
    const progressA = (a.current_amount / a.goal_amount) * 100;
    const progressB = (b.current_amount / b.goal_amount) * 100;
    return progressB - progressA;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <p className="text-muted-foreground text-sm">Hello, {t('billionaire')}</p>
              <h1 className="text-2xl font-bold">{profile?.name || 'Billionaire'}</h1>
            </div>
            <motion.img 
              src={billiLogo} 
              alt="Billi" 
              className="w-12 h-12"
              animate={{ 
                rotate: [0, -5, 5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          </motion.div>

          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 glow-primary mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">{t('totalBalance')}</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={showBalance ? 'visible' : 'hidden'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-4xl font-black gradient-text"
                >
                  {showBalance ? formatCurrency(totalBalance) : '••••••'}
                </motion.span>
              </AnimatePresence>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mt-3 text-success text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>+{groups.length} active groups</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        {/* User Stats */}
        {profile && (
          <UserStatsCard
            currentStreak={profile.current_streak || 0}
            bestStreak={profile.best_streak || 0}
            totalContributions={profile.total_contributions || 0}
            level={profile.level || 1}
            maxSaved={profile.max_saved || 0}
          />
        )}

        {/* Motivational Banner */}
        <MotivationalBanner />

        {/* Daily Challenge */}
        <DailyChallenge 
          hasContributedToday={hasContributedToday}
          onContribute={handleDailyChallengeContribute}
        />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full h-14 btn-primary text-primary-foreground font-semibold rounded-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('createGroup')}
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{t('createGroup')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Group Photo</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                    >
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-sm">Add a photo for your group</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input 
                    placeholder="Ex: Trip to Paris" 
                    className="bg-secondary"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goal ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="50000" 
                    className="bg-secondary"
                    value={newGroup.goal}
                    onChange={(e) => setNewGroup({ ...newGroup, goal: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={creating || uploading || !newGroup.name || !newGroup.goal}
                  className="w-full btn-primary text-primary-foreground"
                >
                  {creating || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="w-full h-14 border-border font-semibold rounded-xl"
              onClick={() => setJoinModalOpen(true)}
            >
              <Hash className="w-5 h-5 mr-2" />
              {t('enterCode')}
            </Button>
          </motion.div>
        </div>

        {/* Groups */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('myGroups')}</h2>
          
          {groupsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : groups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <p className="text-muted-foreground mb-4">You don't have any groups yet.</p>
              <p className="text-sm text-muted-foreground">Create a new group or join one with an invite code!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {sortedGroups.map((group, index) => (
                <EnhancedGroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  image={group.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
                  goal={group.goal_amount}
                  current={group.current_amount}
                  membersCount={group.members.length}
                  onClick={() => onGroupClick(group.id)}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Group Modal */}
      <JoinGroupModal
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false);
          setInitialCode('');
        }}
        onJoinSuccess={handleJoinGroup}
        initialCode={initialCode}
      />
    </div>
  );
};

export default HomePage;
