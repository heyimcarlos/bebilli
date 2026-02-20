import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Mail, ExternalLink } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const SupportCard: React.FC = () => {
  const { t } = useApp();

  return (
    <motion.a
      href="mailto:contact@bebilli.com"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-4 flex items-center gap-3 group cursor-pointer hover:border-primary/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <HelpCircle className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{t('needHelp') || 'Need help?'}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="w-3 h-3" />
          <span>contact@bebilli.com</span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </motion.a>
  );
};

export default SupportCard;
