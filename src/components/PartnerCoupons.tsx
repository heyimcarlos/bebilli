import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, Star, Percent, ExternalLink, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

export interface PartnerCoupon {
  id: string;
  partnerName: string;
  partnerLogo: string;
  discount: string;
  description: Record<string, string>;
  code: string;
  unlockLevel: number;
  category: string;
  expiresAt?: string;
  url?: string;
}

// Demo partner coupons (in production, these would come from the database)
const demoCoupons: PartnerCoupon[] = [
  {
    id: '1',
    partnerName: 'Airbnb',
    partnerLogo: 'https://logo.clearbit.com/airbnb.com',
    discount: '15%',
    description: {
      en: 'Off your next booking',
      pt: 'De desconto na próxima reserva',
      es: 'En tu próxima reserva',
      fr: 'Sur votre prochaine réservation',
      it: 'Sul tuo prossimo soggiorno',
      de: 'Auf Ihre nächste Buchung',
    },
    code: 'BILLI15',
    unlockLevel: 2,
    category: 'Travel',
    url: 'https://airbnb.com',
  },
  {
    id: '2',
    partnerName: 'Uber',
    partnerLogo: 'https://logo.clearbit.com/uber.com',
    discount: '$10',
    description: {
      en: 'Off your next 3 rides',
      pt: 'De desconto nas próximas 3 viagens',
      es: 'En tus próximos 3 viajes',
      fr: 'Sur vos 3 prochaines courses',
      it: 'Sui tuoi prossimi 3 viaggi',
      de: 'Auf Ihre nächsten 3 Fahrten',
    },
    code: 'BILLISAVE10',
    unlockLevel: 3,
    category: 'Transport',
  },
  {
    id: '3',
    partnerName: 'Amazon',
    partnerLogo: 'https://logo.clearbit.com/amazon.com',
    discount: '20%',
    description: {
      en: 'On select products',
      pt: 'Em produtos selecionados',
      es: 'En productos seleccionados',
      fr: 'Sur les produits sélectionnés',
      it: 'Su prodotti selezionati',
      de: 'Auf ausgewählte Produkte',
    },
    code: 'BILLI20OFF',
    unlockLevel: 5,
    category: 'Shopping',
  },
  {
    id: '4',
    partnerName: 'Netflix',
    partnerLogo: 'https://logo.clearbit.com/netflix.com',
    discount: '1 month',
    description: {
      en: 'Free subscription',
      pt: 'Assinatura grátis',
      es: 'Suscripción gratis',
      fr: 'Abonnement gratuit',
      it: 'Abbonamento gratuito',
      de: 'Kostenloses Abonnement',
    },
    code: 'BILLIFREE',
    unlockLevel: 7,
    category: 'Entertainment',
  },
  {
    id: '5',
    partnerName: 'Expedia',
    partnerLogo: 'https://logo.clearbit.com/expedia.com',
    discount: '25%',
    description: {
      en: 'On hotel bookings',
      pt: 'Em reservas de hotéis',
      es: 'En reservas de hoteles',
      fr: 'Sur les réservations d\'hôtels',
      it: 'Sulle prenotazioni alberghiere',
      de: 'Auf Hotelbuchungen',
    },
    code: 'BILLI25HOTEL',
    unlockLevel: 10,
    category: 'Travel',
  },
];

interface PartnerCouponsProps {
  userLevel: number;
  groupProgress?: number; // 0-100
}

const PartnerCoupons: React.FC<PartnerCouponsProps> = ({ userLevel, groupProgress = 0 }) => {
  const { t, language } = useApp();
  const [selectedCoupon, setSelectedCoupon] = useState<PartnerCoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getProgressMilestones = () => {
    return [25, 50, 75, 100];
  };

  const unlockedByProgress = (requiredProgress: number) => groupProgress >= requiredProgress;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t('partners')}</h3>
      </div>

      {/* Progress-based unlocks */}
      <div className="glass-card p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-3">{t('unlockByProgress') || 'Unlock by group progress'}</p>
        <div className="relative">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${groupProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {getProgressMilestones().map((milestone) => (
              <div
                key={milestone}
                className={`flex flex-col items-center ${
                  unlockedByProgress(milestone) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    unlockedByProgress(milestone)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {unlockedByProgress(milestone) ? '✓' : <Lock className="w-3 h-3" />}
                </div>
                <span className="text-xs mt-1">{milestone}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-3">
        {demoCoupons.map((coupon) => {
          const isUnlocked = userLevel >= coupon.unlockLevel;
          
          return (
            <motion.div
              key={coupon.id}
              className={`glass-card p-4 ${!isUnlocked ? 'opacity-60' : ''}`}
              whileHover={isUnlocked ? { scale: 1.02 } : undefined}
              onClick={() => isUnlocked && setSelectedCoupon(coupon)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={coupon.partnerLogo}
                    alt={coupon.partnerName}
                    className={`w-12 h-12 rounded-xl object-contain bg-white p-1 ${
                      !isUnlocked ? 'grayscale' : ''
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + coupon.partnerName[0];
                    }}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">{coupon.partnerName}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {coupon.discount}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {coupon.description[language] || coupon.description.en}
                  </p>
                </div>

                {isUnlocked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(coupon.code);
                    }}
                  >
                    {copiedCode === coupon.code ? '✓' : <Percent className="w-4 h-4" />}
                  </Button>
                ) : (
                  <div className="text-xs text-muted-foreground text-center">
                    <Lock className="w-4 h-4 mx-auto mb-1" />
                    Lvl {coupon.unlockLevel}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Coupon Detail Modal */}
      <AnimatePresence>
        {selectedCoupon && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCoupon(null)}
          >
            <motion.div
              className="w-full max-w-sm bg-card rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <img
                  src={selectedCoupon.partnerLogo}
                  alt={selectedCoupon.partnerName}
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 object-contain bg-white p-2"
                />
                <h3 className="text-xl font-bold mb-1">{selectedCoupon.partnerName}</h3>
                <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/20 text-primary font-bold text-lg mb-4">
                  <Star className="w-5 h-5" />
                  {selectedCoupon.discount}
                </div>
                <p className="text-muted-foreground mb-6">
                  {selectedCoupon.description[language] || selectedCoupon.description.en}
                </p>
                
                <div className="bg-secondary rounded-xl p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">{t('couponCode') || 'Coupon Code'}</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">{selectedCoupon.code}</p>
                </div>

                <Button
                  className="w-full btn-primary text-primary-foreground mb-2"
                  onClick={() => handleCopyCode(selectedCoupon.code)}
                >
                  {copiedCode === selectedCoupon.code ? '✓ Copied!' : t('copyCode') || 'Copy Code'}
                </Button>

                {selectedCoupon.url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedCoupon.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('visitPartner') || 'Visit Partner'}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerCoupons;
