import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Hash, TrendingUp, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import GroupCard from '@/components/GroupCard';
import { Button } from '@/components/ui/button';
import billiLogo from '@/assets/billi-logo.png';
import JoinGroupModal from '@/components/JoinGroupModal';
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
  const { profile, groups, groupsLoading, createGroup, joinGroupByCode } = useAuthContext();
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [initialCode, setInitialCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', goal: '' });

  // Check for invite code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setInitialCode(code.toUpperCase());
      setJoinModalOpen(true);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const totalBalance = groups.reduce((sum, g) => sum + g.current_amount, 0);

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.goal) return;
    
    setCreating(true);
    const { error } = await createGroup(newGroup.name, Number(newGroup.goal));
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-sm">Hello, {t('billionaire')}</p>
              <h1 className="text-2xl font-bold">{profile?.name || 'Billionaire'}</h1>
            </div>
            <img src={billiLogo} alt="Billi" className="w-12 h-12" />
          </div>

          {/* Balance Card */}
          <div className="glass-card p-6 glow-primary">
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
              <span className="text-4xl font-black gradient-text">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 btn-primary text-primary-foreground font-semibold rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                {t('createGroup')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{t('createGroup')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                  disabled={creating || !newGroup.name || !newGroup.goal}
                  className="w-full btn-primary text-primary-foreground"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="h-14 border-border font-semibold rounded-xl"
            onClick={() => setJoinModalOpen(true)}
          >
            <Hash className="w-5 h-5 mr-2" />
            {t('enterCode')}
          </Button>
        </div>
      </div>

      {/* Groups */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4">{t('myGroups')}</h2>
        
        {groupsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any groups yet.</p>
            <p className="text-sm text-muted-foreground">Create a new group or join one with an invite code!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                image={group.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
                goal={group.goal_amount}
                current={group.current_amount}
                membersCount={group.members.length}
                onClick={() => onGroupClick(group.id)}
              />
            ))}
          </div>
        )}
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
