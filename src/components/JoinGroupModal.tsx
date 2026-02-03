import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (code: string) => Promise<boolean>;
  initialCode?: string;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoinSuccess,
  initialCode = '' 
}) => {
  const { t } = useApp();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleJoin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const success = await onJoinSuccess(code);
      if (!success) {
        setError(t('invalidCode'));
      }
    } catch (err) {
      setError(t('invalidCode'));
    } finally {
      setIsLoading(false);
    }
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t('joinGroup')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Create a group to get an invite code to share with friends!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupModal;
