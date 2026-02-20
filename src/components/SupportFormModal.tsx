import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, Loader2, Crown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
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
  const { isPremium } = usePremiumCheck(user?.id);
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

    // Premium users get priority tag in subject
    const priorityPrefix = isPremium ? '[⭐ VIP PRIORITY] ' : '';
    const fullSubject = `${priorityPrefix}${subject}`;
    const premiumTag = isPremium ? `\n🌟 Status: VIP Premium Member\n` : '';
    const body = `${t('supportName') || 'Name'}: ${name}\n${t('email') || 'Email'}: ${email}${premiumTag}\n\n${description}`;
    const mailtoLink = `mailto:contact@bebilli.com?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink, '_blank');
    
    toast({
      title: isPremium 
        ? (t('prioritySupportSent') || '⭐ Priority support request sent!')
        : (t('supportSent') || 'Support request sent!'),
      description: isPremium
        ? (t('prioritySupportSentDesc') || 'As a VIP member, your request will be handled with priority.')
        : (t('supportSentDesc') || 'Your email client has been opened with the message.'),
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
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold ml-auto">
                <Crown className="w-3 h-3" />
                {t('prioritySupport') || 'Priority'}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2"
          >
            <Crown className="w-4 h-4 shrink-0" />
            {t('vipSupportMessage') || 'As a VIP member, your support request is prioritized and handled faster.'}
          </motion.div>
        )}

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
          <Button type="submit" className={`w-full h-10 ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' : ''}`} disabled={sending || !subject.trim() || !description.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {isPremium ? (t('sendPriority') || '⭐ Send Priority') : (t('supportSend') || 'Send')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportFormModal;
