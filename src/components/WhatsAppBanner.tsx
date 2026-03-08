import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

const WhatsAppBanner: React.FC = () => {
  const { t } = useApp();
  const [botNumber, setBotNumber] = useState<string>('');

  useEffect(() => {
    const fetchBotNumber = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'whatsapp_bot_number')
        .single();
      if (data?.value) setBotNumber(data.value);
    };
    fetchBotNumber();
  }, []);

  const whatsappLink = botNumber
    ? `https://wa.me/${botNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('/ativar')}`
    : '#';

  if (!botNumber) return null; // Don't show banner if no bot number configured

  return (
    <motion.a
      href={whatsappLink}
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
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {t('whatsappActivateHint') || 'Send /ativar [your phone] to link your account'}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-[#25D366] flex-shrink-0" />
      </div>
    </motion.a>
  );
};

export default WhatsAppBanner;
