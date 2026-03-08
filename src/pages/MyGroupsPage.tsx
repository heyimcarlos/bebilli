import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Loader2, Plus, Target, ImagePlus, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { useImageUpload } from '@/hooks/useImageUpload';
import { validateGoalAmount } from '@/lib/validation';
import EnhancedGroupCard from '@/components/EnhancedGroupCard';
import EditGroupModal from '@/components/EditGroupModal';
import PremiumModal from '@/components/PremiumModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MyGroupsPageProps {
  onGroupClick: (groupId: string) => void;
}

const MyGroupsPage: React.FC<MyGroupsPageProps> = ({ onGroupClick }) => {
  const { t } = useApp();
  const { user, groups, groupsLoading, createGroup, updateGroup, deleteGroup, leaveGroup, hideGroup, refreshGroups } = useAuthContext();
  const { canCreateOrJoinGroup, refresh: refreshPremium } = usePremiumCheck(user?.id);
  const { uploadGroupImage, uploading } = useImageUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create group state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', goal: '', description: '', category: 'other', type: 'shared' as 'individual' | 'shared', goalMode: 'fixed' as 'fixed' | 'competition', competitionEndDate: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Edit group state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<{ id: string; name: string; description: string | null; image_url: string | null; goal_amount: number } | null>(null);

  // Confirm action state
  const [confirmAction, setConfirmAction] = useState<{ type: 'leave' | 'delete'; groupId: string; groupName: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const sortedGroups = [...groups].sort((a, b) => {
    const aProgress = a.goal_amount > 0 ? a.current_amount / a.goal_amount : 0;
    const bProgress = b.goal_amount > 0 ? b.current_amount / b.goal_amount : 0;
    return bProgress - aProgress;
  });

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Create group
  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.goal || !user) return;
    if (!canCreateOrJoinGroup()) { setCreateModalOpen(false); setPremiumModalOpen(true); return; }
    const goalAmount = validateGoalAmount(newGroup.goal);
    if (goalAmount === null) {
      toast({ title: t('error'), description: t('invalidAmountError'), variant: 'destructive' });
      return;
    }
    setCreating(true);
    let imageUrl: string | undefined;
    if (selectedImage) {
      const uploadedUrl = await uploadGroupImage(selectedImage, user.id);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }
    const isOpenGoal = newGroup.goalMode === 'competition';
    const { error } = await createGroup(newGroup.name, goalAmount, imageUrl, newGroup.description || undefined, newGroup.type, newGroup.category, isOpenGoal, newGroup.competitionEndDate || undefined);
    setCreating(false);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🎉 ' + t('groupCreated'), description: `${newGroup.name} ${t('groupCreatedDesc')}` });
      setCreateModalOpen(false);
      setNewGroup({ name: '', goal: '', description: '', category: 'other', type: 'shared', goalMode: 'fixed', competitionEndDate: '' });
      clearImage();
      refreshPremium();
    }
  };

  // Confirm action handler
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'leave') {
        const { error } = await leaveGroup(confirmAction.groupId);
        if (error) throw error;
        toast({ title: t('leftGroup') || 'Left group', description: confirmAction.groupName });
      } else if (confirmAction.type === 'delete') {
        const { error } = await deleteGroup(confirmAction.groupId);
        if (error) throw error;
        toast({ title: t('groupDeleted') || 'Group deleted', description: confirmAction.groupName });
      }
      await refreshGroups();
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  // Hide group handler
  const handleHideGroup = async (groupId: string) => {
    const { error } = await hideGroup(groupId);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('groupHidden') || 'Group hidden' });
      await refreshGroups();
    }
  };

  return (
    <div className="px-6 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.h1
          className="text-2xl font-black"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('myGroups')}
        </motion.h1>
      </div>

      {groupsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border bg-card p-10 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">{t('noGroupsYet')}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('createOrJoin')}
          </p>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-primary-foreground px-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('createGroup')}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map((group, index) => {
            const isPending = group.group_type === 'shared' && group.members.length < 2;
            const isAdmin = group.members.find(m => m.user_id === user?.id)?.role === 'admin';

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EnhancedGroupCard
                  id={group.id}
                  name={group.name}
                  image={group.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
                  goal={group.goal_amount}
                  current={group.current_amount}
                  membersCount={group.members.length}
                  onClick={() => onGroupClick(group.id)}
                  rank={index + 1}
                  groupType={group.group_type || 'shared'}
                  isPending={isPending}
                  isAdmin={isAdmin || false}
                  onEdit={isAdmin ? () => {
                    setEditGroup({ id: group.id, name: group.name, description: group.description, image_url: group.image_url, goal_amount: group.goal_amount });
                    setEditModalOpen(true);
                  } : undefined}
                  onLeave={() => setConfirmAction({ type: 'leave', groupId: group.id, groupName: group.name })}
                  onHide={() => handleHideGroup(group.id)}
                  onDelete={isAdmin ? () => setConfirmAction({ type: 'delete', groupId: group.id, groupName: group.name }) : undefined}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      {groups.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!canCreateOrJoinGroup()) { setPremiumModalOpen(true); return; }
            setCreateModalOpen(true);
          }}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('createGroup')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {/* Group Type */}
            <div className="space-y-2">
              <Label>{t('groupType')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setNewGroup({ ...newGroup, type: 'individual' })}
                  className={`p-3 rounded-xl border text-center text-sm transition-all ${newGroup.type === 'individual' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'}`}>
                  <span className="text-lg block">👤</span>
                  <span className="text-xs">{t('individualGroup')}</span>
                </button>
                <button type="button" onClick={() => setNewGroup({ ...newGroup, type: 'shared' })}
                  className={`p-3 rounded-xl border text-center text-sm transition-all ${newGroup.type === 'shared' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'}`}>
                  <span className="text-lg block">👥</span>
                  <span className="text-xs">{t('sharedGroup')}</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newGroup.type === 'individual' ? t('individualGroupDesc') : t('sharedGroupDesc')}
              </p>
            </div>
            {/* Photo */}
            <div className="space-y-2">
              <Label>{t('groupPhoto')}</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              {imagePreview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={clearImage} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImagePlus className="w-8 h-8" /><span className="text-sm">{t('addPhotoForGroup')}</span>
                </button>
              )}
            </div>
            {/* Name */}
            <div className="space-y-2"><Label>{t('groupName')}</Label><Input placeholder={t('groupNamePlaceholder')} className="bg-secondary" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} /></div>
            {/* Category */}
            <div className="space-y-2">
              <Label>{t('goalCategory')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'travel', icon: '✈️', label: t('travel') },
                  { id: 'real_estate', icon: '🏠', label: t('realEstate') },
                  { id: 'investment', icon: '📈', label: t('investment') },
                  { id: 'education', icon: '🎓', label: t('education') },
                  { id: 'credit_card', icon: '💳', label: t('creditCard') },
                  { id: 'other', icon: '🎁', label: t('other') },
                ].map(cat => (
                  <button key={cat.id} type="button" onClick={() => setNewGroup({ ...newGroup, category: cat.id })}
                    className={`p-2 rounded-xl border text-center text-sm transition-all ${newGroup.category === cat.id ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'}`}>
                    <span className="text-lg block">{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Goal Mode */}
            <div className="space-y-2">
              <Label>{t('goalMode') || 'Modo da Meta'}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setNewGroup({ ...newGroup, goalMode: 'fixed' })}
                  className={`p-3 rounded-xl border text-center text-sm transition-all ${newGroup.goalMode === 'fixed' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'}`}>
                  <span className="text-lg block">🎯</span>
                  <span className="text-xs">{t('fixedGoal')}</span>
                </button>
                <button type="button" onClick={() => setNewGroup({ ...newGroup, goalMode: 'competition' })}
                  className={`p-3 rounded-xl border text-center text-sm transition-all ${newGroup.goalMode === 'competition' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'}`}>
                  <span className="text-lg block">🏆</span>
                  <span className="text-xs">{t('openGoal')}</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newGroup.goalMode === 'fixed' ? t('fixedGoalDesc') : t('openGoalDesc')}
              </p>
            </div>
            {/* Competition End Date */}
            {newGroup.goalMode === 'competition' && (
              <div className="space-y-2">
                <Label>{t('competitionEndDate')}</Label>
                <Input type="date" className="bg-secondary" value={newGroup.competitionEndDate} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setNewGroup({ ...newGroup, competitionEndDate: e.target.value })} />
              </div>
            )}
            {/* Goal amount */}
            <div className="space-y-2">
              <Label>{newGroup.goalMode === 'competition' ? (t('monthlySalary') || 'Valor do salário mensal') : `${t('goalAmount')} ($)`}</Label>
              <Input type="number" placeholder={newGroup.goalMode === 'competition' ? '5000' : '50000'} className="bg-secondary" value={newGroup.goal} onChange={(e) => setNewGroup({ ...newGroup, goal: e.target.value })} />
              {newGroup.goalMode === 'competition' && (
                <p className="text-xs text-muted-foreground">{t('monthlySalaryDesc') || 'Informe o salário mensal para calcular o ranking de economia'}</p>
              )}
            </div>
            {/* Description */}
            <div className="space-y-2"><Label>{t('descriptionOptional')}</Label><Textarea placeholder={t('descriptionPlaceholder')} className="bg-secondary resize-none" rows={3} value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} /></div>
            <Button onClick={handleCreateGroup} disabled={creating || uploading || !newGroup.name || !newGroup.goal} className="w-full btn-primary text-primary-foreground">
              {creating || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('createGroupButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Group Modal */}
      {editGroup && user && (
        <EditGroupModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditGroup(null); }}
          groupId={editGroup.id}
          currentName={editGroup.name}
          currentDescription={editGroup.description}
          currentImageUrl={editGroup.image_url}
          currentGoalAmount={editGroup.goal_amount}
          onSave={async (updates) => {
            const result = await updateGroup(editGroup.id, updates);
            if (!result.error) await refreshGroups();
            return result;
          }}
          userId={user.id}
        />
      )}

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete' ? (t('deleteGroup') || 'Delete Group') : (t('leaveGroup') || 'Leave Group')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `${t('confirmDelete') || 'Are you sure you want to delete'} "${confirmAction?.groupName}"? ${t('actionIrreversible') || 'This action cannot be undone.'}`
                : `${t('confirmLeave') || 'Are you sure you want to leave'} "${confirmAction?.groupName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>{t('cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (confirmAction?.type === 'delete' ? (t('delete') || 'Delete') : (t('leave') || 'Leave'))}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Premium Modal */}
      <PremiumModal isOpen={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} reason="group_limit" />
    </div>
  );
};

export default MyGroupsPage;
