import React from 'react';
import { useApp, Language, Currency } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';

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

const LanguageCurrencyBar: React.FC = () => {
  const { language, setLanguage, currency, setCurrency } = useApp();
  const { user, updateProfile } = useAuthContext();

  const handleLang = async (lang: Language) => {
    setLanguage(lang);
    if (user) await updateProfile({ language: lang } as any);
  };

  const handleCurr = async (curr: Currency) => {
    setCurrency(curr);
    if (user) await updateProfile({ currency: curr } as any);
  };

  return (
    <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border px-3 py-1.5">
      <div className="flex gap-1 mb-1 overflow-x-auto scrollbar-none">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleLang(l.code)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              language === l.code
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {currencies.map((c) => (
          <button
            key={c.code}
            onClick={() => handleCurr(c.code)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              currency === c.code
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {c.flag} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageCurrencyBar;
