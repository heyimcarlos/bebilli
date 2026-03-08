import React from 'react';
import { User, Crown, EyeOff, HelpCircle, Search } from 'lucide-react';
import { useApp, Language, Currency } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfile: () => void;
  onPremium: () => void;
  onHiddenGroups: () => void;
  onHelp: () => void;
  onSearch: () => void;
}

const languages: { code: Language; flag: string; label: string }[] = [
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
  { code: 'en', flag: '🇨🇦', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

const currencies: { code: Currency; flag: string; label: string }[] = [
  { code: 'BRL', flag: '🇧🇷', label: 'R$ BRL' },
  { code: 'CAD', flag: '🇨🇦', label: 'CA$ CAD' },
  { code: 'USD', flag: '🇺🇸', label: 'US$ USD' },
  { code: 'EUR', flag: '🇫🇷', label: '€ EUR' },
];

const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onProfile,
  onPremium,
  onHiddenGroups,
  onHelp,
  onSearch,
}) => {
  const { t, language, setLanguage, currency, setCurrency } = useApp();
  const { user, updateProfile } = useAuthContext();

  const items = [
    { icon: User, label: t('profile'), action: onProfile },
    { icon: Search, label: t('searchUsers'), action: onSearch },
    { icon: Crown, label: 'VIP / Premium', action: onPremium, accent: true },
    { icon: EyeOff, label: t('hiddenGroups'), action: onHiddenGroups },
    { icon: HelpCircle, label: t('needHelp'), action: onHelp },
  ];

  const handleLang = async (lang: Language) => {
    setLanguage(lang);
    if (user) await updateProfile({ language: lang } as any);
  };

  const handleCurr = async (curr: Currency) => {
    setCurrency(curr);
    if (user) await updateProfile({ currency: curr } as any);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-lg font-bold">{t('menu')}</SheetTitle>
        </SheetHeader>

        <div className="p-3 space-y-1">
          {items.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full justify-start gap-3 px-4 py-3 h-auto ${
                item.accent ? 'text-amber-500 hover:text-amber-500' : ''
              }`}
              onClick={() => { item.action(); onClose(); }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </div>

        <Separator />

        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('language') || 'Language'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLang(l.code)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  language === l.code
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
            {t('currency') || 'Currency'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCurr(c.code)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  currency === c.code
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {c.flag} {c.label}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideDrawer;
