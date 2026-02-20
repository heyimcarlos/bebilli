import React from 'react';
import { Share2, MessageCircle, Send, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

const InviteToBilli: React.FC = () => {
  const { t, language } = useApp();
  const { toast } = useToast();

  const appLink = `${window.location.origin}`;
  const inviteMessage = t('inviteMessage') + ` ${appLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appLink);
    toast({ title: t('linkCopied'), description: t('shareWithFriends') });
  };

  const shareToWhatsApp = () => {
    window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
  };

  const shareToTelegram = () => {
    window.location.href = `https://t.me/share/url?url=${encodeURIComponent(appLink)}&text=${encodeURIComponent(inviteMessage)}`;
  };

  const shareToTwitter = () => {
    window.location.href = `https://x.com/intent/tweet?text=${encodeURIComponent(inviteMessage)}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Billi', text: inviteMessage, url: appLink });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t('inviteToBilli')}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t('inviteToBilliDesc')}</p>
      
      <div className="grid grid-cols-4 gap-3">
        <button onClick={shareToWhatsApp} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs">WhatsApp</span>
        </button>

        <button onClick={shareToTelegram} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs">Telegram</span>
        </button>

        <button onClick={shareToTwitter} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center">
            <span className="text-white font-bold">𝕏</span>
          </div>
          <span className="text-xs">Twitter</span>
        </button>

        <button onClick={handleNativeShare} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xs">{t('more')}</span>
        </button>
      </div>

      <Button onClick={handleCopyLink} variant="outline" className="w-full mt-3 gap-2">
        <Copy className="w-4 h-4" />
        {t('linkCopied') ? t('inviteLink') : 'Copy Link'}
      </Button>
    </div>
  );
};

export default InviteToBilli;
