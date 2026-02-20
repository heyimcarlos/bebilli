import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Download, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import BilliLogo from '@/components/BilliLogo';
import DefaultAvatar from '@/components/DefaultAvatar';

interface ShareProgressCardProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalSaved: number;
    level: number;
    streak: number;
    groupsCount: number;
    contributionsCount: number;
  };
}

const ShareProgressCard: React.FC<ShareProgressCardProps> = ({ isOpen, onClose, stats }) => {
  const { t, formatCurrency } = useApp();
  const { profile } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getLevelTitle = (level: number) => {
    if (level >= 10) return '🏆 Mestre da Economia';
    if (level >= 7) return '💎 Expert';
    if (level >= 5) return '🌟 Avançado';
    if (level >= 3) return '🚀 Intermediário';
    return '🌱 Iniciante';
  };

  const getMotivationalPhrase = () => {
    const phrases = [
      'Cada centavo conta! 💪',
      'Economizando para realizar sonhos! ✨',
      'Juntos somos mais fortes! 🤝',
      'Construindo o futuro! 🏗️',
      'Foco no objetivo! 🎯',
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const shareText = `🎯 Minhas conquistas na Billi!\n\n💰 Já economizei: ${formatCurrency(stats.totalSaved)}\n⭐ Nível: ${stats.level} - ${getLevelTitle(stats.level)}\n🔥 Sequência: ${stats.streak} dias\n👥 Grupos: ${stats.groupsCount}\n\n${getMotivationalPhrase()}\n\nBaixe a Billi e comece a economizar com amigos!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minhas conquistas na Billi',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText + `\n\n${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 rounded-full hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Shareable Card */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 shadow-2xl"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 right-4 w-16 h-16 bg-white/5 rounded-full" />
            
            {/* Sparkle decorations */}
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-300/60" />
            <Sparkles className="absolute bottom-20 left-4 w-4 h-4 text-yellow-300/40" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <BilliLogo size={40} />
                <div>
                  <h3 className="text-white font-bold text-lg">Billi</h3>
                  <p className="text-white/70 text-xs">Economize junto</p>
                </div>
              </div>

              {/* User info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <DefaultAvatar name={profile?.name || 'User'} size={64} />
                  )}
                </div>
                <h2 className="text-white font-bold text-xl">{profile?.name || 'Economista'}</h2>
                <p className="text-white/80 text-sm">{getLevelTitle(stats.level)}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <p className="text-white/70 text-xs mb-1">Economizado</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(stats.totalSaved)}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <p className="text-white/70 text-xs mb-1">Nível</p>
                  <p className="text-white font-bold text-lg">⭐ {stats.level}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <p className="text-white/70 text-xs mb-1">Sequência</p>
                  <p className="text-white font-bold text-lg">🔥 {stats.streak} dias</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <p className="text-white/70 text-xs mb-1">Grupos</p>
                  <p className="text-white font-bold text-lg">👥 {stats.groupsCount}</p>
                </div>
              </div>

              {/* Motivational phrase */}
              <div className="text-center">
                <p className="text-white/90 text-sm italic">{getMotivationalPhrase()}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareProgressCard;
