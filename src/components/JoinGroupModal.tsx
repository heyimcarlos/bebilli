import React, { useState } from 'react';
import { Users, ArrowRight, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (groupId: string) => void;
  initialCode?: string;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoinSuccess,
  initialCode = '' 
}) => {
  const { t, groups } = useApp();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = () => {
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const group = groups.find(g => g.inviteCode?.toUpperCase() === code.toUpperCase());
      
      if (group) {
        toast({
          title: t('joinedGroup'),
          description: `${t('welcome')} ${group.name}! 🎉`,
        });
        onJoinSuccess(group.id);
        onClose();
      } else {
        setError(t('invalidCode'));
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t('enterCode')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('enterCodeDescription')}
          </p>

          {/* Code Input */}
          <div className="space-y-2">
            <Input
              value={code}
              onChange={handleCodeChange}
              placeholder="XXXXXX"
              className="text-center text-2xl tracking-[0.5em] font-bold bg-secondary h-14"
              maxLength={6}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={code.length < 6 || isLoading}
            className="w-full btn-primary text-primary-foreground h-12"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {t('joinGroup')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Demo codes hint */}
          <p className="text-xs text-muted-foreground text-center">
            {t('demoCodes')}: <span className="text-primary font-mono">JAPAO1</span>, <span className="text-primary font-mono">BYDCAR</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupModal;
