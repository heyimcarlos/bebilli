import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Send, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  inviteCode: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, groupName, inviteCode }) => {
  const { t, language } = useApp();
  const [copied, setCopied] = useState(false);

  // Handle case when invite code is not available
  const hasValidCode = inviteCode && inviteCode !== 'undefined' && inviteCode.length > 0;
  const displayCode = hasValidCode ? inviteCode : '------';
  const inviteLink = hasValidCode ? `${window.location.origin}?code=${inviteCode}` : '';
  
  // Dynamic invite message based on language
  const getInviteMessage = () => {
    if (!hasValidCode) return '';
    const msgs: Record<string, string> = {
      pt: `🚀 Junte-se ao grupo "${groupName}" na Billi e vamos conquistar nosso sonho juntos! Use o código: ${inviteCode} ou acesse: ${inviteLink}`,
      fr: `🚀 Rejoignez le groupe "${groupName}" sur Billi et réalisons notre rêve ensemble! Code: ${inviteCode} ou accédez: ${inviteLink}`,
    };
    return msgs[language] || `🚀 Join the group "${groupName}" on Billi and let's achieve our dream together! Use the code: ${inviteCode} or access: ${inviteLink}`;
  };

  const inviteMessage = getInviteMessage();

  const handleCopyCode = () => {
    if (!hasValidCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast({
      title: t('codeCopied'),
      description: inviteCode,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!hasValidCode) return;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: t('linkCopied'),
      description: t('shareWithFriends'),
    });
  };

  const shareToWhatsApp = () => {
    if (!hasValidCode) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.location.href = url;
  };

  const shareToTelegram = () => {
    if (!hasValidCode) return;
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(inviteMessage)}`;
    window.location.href = url;
  };

  const shareToTwitter = () => {
    if (!hasValidCode) return;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(inviteMessage)}`;
    window.location.href = url;
  };

  const handleNativeShare = async () => {
    if (!hasValidCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Billi - ${groupName}`,
          text: inviteMessage,
          url: inviteLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {t('inviteFriends')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invite Code Display */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">{t('inviteCode')}</p>
            {hasValidCode ? (
              <div className="flex items-center justify-center gap-2">
                <div className="bg-secondary px-6 py-3 rounded-xl">
                  <span className="text-2xl font-bold tracking-widest text-primary">
                    {displayCode}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="h-12 w-12"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-secondary px-6 py-3 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  {language === 'pt' ? 'Código não disponível' : 'Code not available'}
                </p>
              </div>
            )}
          </div>

          {/* Copy Link */}
          {hasValidCode && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('inviteLink')}</p>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="bg-secondary text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  <Link2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          {hasValidCode && (
            <div>
              <p className="text-sm text-muted-foreground mb-3 text-center">{t('shareOn')}</p>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs">WhatsApp</span>
                </button>

                <button
                  onClick={shareToTelegram}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs">Telegram</span>
                </button>

                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                    <span className="text-white font-bold">𝕏</span>
                  </div>
                  <span className="text-xs">Twitter</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs">{t('more')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
