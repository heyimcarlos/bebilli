import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, Loader2, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SupportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportFormModal: React.FC<SupportFormModalProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();
  const { profile, user } = useAuthContext();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !description.trim()) return;

    setSending(true);

    // Build mailto link with pre-filled content
    const body = `${t('supportName') || 'Name'}: ${name}\n${t('email') || 'Email'}: ${email}\n\n${description}`;
    const mailtoLink = `mailto:contact@bebilli.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink, '_blank');
    
    toast({
      title: t('supportSent') || 'Support request sent!',
      description: t('supportSentDesc') || 'Your email client has been opened with the message.',
    });

    setSending(false);
    setSubject('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            {t('needHelp') || 'Need help?'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">{t('supportName') || 'Name'}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterName') || 'Enter your name'}
              className="h-9 text-sm"
              required
              maxLength={100}
            />
          </div>
          <div>
            <Label className="text-xs">{t('email') || 'Email'}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enterEmail') || 'Enter your email'}
              className="h-9 text-sm"
              required
              maxLength={255}
            />
          </div>
          <div>
            <Label className="text-xs">{t('supportSubject') || 'Subject'}</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('supportSubjectPlaceholder') || 'What do you need help with?'}
              className="h-9 text-sm"
              required
              maxLength={200}
            />
          </div>
          <div>
            <Label className="text-xs">{t('supportDescription') || 'Description'}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('supportDescriptionPlaceholder') || 'Describe your issue in detail...'}
              className="text-sm min-h-[100px] resize-none"
              required
              maxLength={2000}
            />
          </div>
          <Button type="submit" className="w-full h-10" disabled={sending || !subject.trim() || !description.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {t('supportSend') || 'Send'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportFormModal;
