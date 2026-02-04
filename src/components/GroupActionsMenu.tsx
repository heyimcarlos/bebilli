import React, { useState } from 'react';
import { MoreVertical, EyeOff, LogOut, Trash2, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroupActionsMenuProps {
  groupId: string;
  groupName: string;
  isAdmin: boolean;
  onHide: () => Promise<{ error: Error | null }>;
  onLeave: () => Promise<{ error: Error | null }>;
  onDelete: () => Promise<{ error: Error | null }>;
  onBack: () => void;
}

const GroupActionsMenu: React.FC<GroupActionsMenuProps> = ({
  groupId,
  groupName,
  isAdmin,
  onHide,
  onLeave,
  onDelete,
  onBack,
}) => {
  const { t } = useApp();
  const { toast } = useToast();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const handleHide = async () => {
    setLoading(true);
    const { error } = await onHide();
    setLoading(false);
    if (!error) {
      toast({
        title: '👁️ ' + (t('groupHidden') || 'Group hidden'),
        description: t('groupHiddenDesc') || 'You can restore it from the hidden groups menu',
      });
      onBack();
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    const { error } = await onLeave();
    setLoading(false);
    setShowLeaveDialog(false);
    if (!error) {
      onBack();
    }
  };

  const handleDeleteRequest = () => {
    setShowDeleteDialog(false);
    setShowPasswordDialog(true);
    setPassword('');
  };

  const handlePasswordVerify = async () => {
    if (!password) return;
    
    setVerifyingPassword(true);
    
    try {
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          title: t('error'),
          description: t('userNotFound') || 'User not found',
          variant: 'destructive',
        });
        setVerifyingPassword(false);
        return;
      }

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInError) {
        toast({
          title: t('error'),
          description: t('incorrectPassword') || 'Incorrect password',
          variant: 'destructive',
        });
        setVerifyingPassword(false);
        return;
      }

      // Password verified, proceed with deletion
      setVerifyingPassword(false);
      setShowPasswordDialog(false);
      setPassword('');
      
      setLoading(true);
      const { error } = await onDelete();
      setLoading(false);
      
      if (!error) {
        toast({
          title: '🗑️ ' + (t('groupDeleted') || 'Group deleted'),
          description: t('groupDeletedDesc') || 'The group has been permanently deleted',
        });
        onBack();
      }
    } catch (err) {
      toast({
        title: t('error'),
        description: t('verificationFailed') || 'Password verification failed',
        variant: 'destructive',
      });
      setVerifyingPassword(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleHide} disabled={loading}>
            <EyeOff className="w-4 h-4 mr-2" />
            {t('hideGroup') || 'Hide group'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowLeaveDialog(true)} 
            disabled={loading}
            className="text-warning focus:text-warning"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('leaveGroup') || 'Leave group'}
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)} 
                disabled={loading}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('deleteGroup') || 'Delete group'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Leave Group Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('leaveGroup') || 'Leave group'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('leaveGroupConfirm') || `Are you sure you want to leave "${groupName}"? You will lose access to contributions and group history.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('cancel') || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={loading}
              className="bg-warning hover:bg-warning/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('leave') || 'Leave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteGroup') || 'Delete group'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteGroupConfirm') || `Are you sure you want to delete "${groupName}"? This action is irreversible and all group data will be permanently lost.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('cancel') || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('continue') || 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-destructive" />
              {t('confirmWithPassword') || 'Confirm with password'}
            </DialogTitle>
            <DialogDescription>
              {t('enterPasswordToDelete') || `Enter your password to confirm deletion of "${groupName}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="password">{t('password') || 'Password'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-secondary"
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerify()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword('');
              }}
              disabled={verifyingPassword}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordVerify}
              disabled={!password || verifyingPassword}
            >
              {verifyingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('deleteGroup') || 'Delete group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupActionsMenu;
