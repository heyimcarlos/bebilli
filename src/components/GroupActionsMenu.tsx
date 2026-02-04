import React, { useState } from 'react';
import { MoreVertical, EyeOff, LogOut, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useApp } from '@/contexts/AppContext';

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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHide = async () => {
    setLoading(true);
    const { error } = await onHide();
    setLoading(false);
    if (!error) {
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

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await onDelete();
    setLoading(false);
    setShowDeleteDialog(false);
    if (!error) {
      onBack();
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
            {t('hideGroup') || 'Ocultar grupo'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowLeaveDialog(true)} 
            disabled={loading}
            className="text-warning focus:text-warning"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('leaveGroup') || 'Sair do grupo'}
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
                {t('deleteGroup') || 'Apagar grupo'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Leave Group Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('leaveGroup') || 'Sair do grupo'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('leaveGroupConfirm') || `Tem certeza que deseja sair de "${groupName}"? Você perderá acesso às contribuições e ao histórico do grupo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('cancel') || 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={loading}
              className="bg-warning hover:bg-warning/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('leave') || 'Sair')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteGroup') || 'Apagar grupo'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteGroupConfirm') || `Tem certeza que deseja apagar "${groupName}"? Esta ação é irreversível e todos os dados do grupo serão perdidos permanentemente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('cancel') || 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('delete') || 'Apagar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GroupActionsMenu;
