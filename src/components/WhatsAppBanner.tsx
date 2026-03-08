import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const WHATSAPP_BOT_LINK = 'https://wa.me/15551234567?text=Oi'; // Replace with actual bot number

const WhatsAppBanner: React.FC = () => {
  const { t } = useApp();

  return (
    <motion.a
      href={WHATSAPP_BOT_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl p-4 bg-gradient-to-r from-[#25D366]/15 to-[#128C7E]/15 border border-[#25D366]/30 hover:border-[#25D366]/50 transition-all"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#25D366]/20">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{t('whatsappBotTitle') || 'Use Billi on WhatsApp!'}</h3>
            <span className="text-[10px] font-bold bg-[#25D366] text-white px-1.5 py-0.5 rounded-full uppercase">
              {t('new') || 'New'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {t('whatsappBotDesc') || 'Add contributions, check rankings, and manage your groups directly from WhatsApp.'}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-[#25D366] flex-shrink-0" />
      </div>
    </motion.a>
  );
};

export default WhatsAppBanner;
