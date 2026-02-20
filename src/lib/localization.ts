// Extended localization support - 25+ countries and currencies

export type ExtendedCurrency = 
  | 'CAD' | 'USD' | 'EUR' | 'BRL' | 'MXN' | 'CHF' | 'GBP'
  | 'AUD' | 'JPY' | 'CNY' | 'INR' | 'KRW' | 'SGD' | 'HKD'
  | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'ZAR' | 'AED'
  | 'SAR' | 'THB' | 'MYR' | 'PHP' | 'COP' | 'CLP' | 'ARS';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: ExtendedCurrency;
  locale: string;
}

export const countries: Country[] = [
  // North America
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', locale: 'en-CA' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', locale: 'es-MX' },
  
  // South America
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', locale: 'pt-BR' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', locale: 'es-AR' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP', locale: 'es-CO' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP', locale: 'es-CL' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', locale: 'en-GB' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', locale: 'fr-FR' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', locale: 'de-DE' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', locale: 'it-IT' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', locale: 'es-ES' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', locale: 'pt-PT' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', locale: 'nl-NL' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR', locale: 'fr-BE' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', locale: 'de-CH' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', locale: 'sv-SE' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK', locale: 'nb-NO' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', locale: 'da-DK' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', locale: 'pl-PL' },
  
  // Asia
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', locale: 'ja-JP' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', locale: 'zh-CN' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', locale: 'ko-KR' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', locale: 'en-IN' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', locale: 'en-SG' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', locale: 'zh-HK' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', locale: 'th-TH' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', locale: 'ms-MY' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', locale: 'en-PH' },
  
  // Middle East
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', locale: 'ar-AE' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', locale: 'ar-SA' },
  
  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', locale: 'en-AU' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', locale: 'en-NZ' },
  
  // Africa
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', locale: 'en-ZA' },
];

// Exchange rates relative to CAD (base currency)
export const currencyRates: Record<ExtendedCurrency, number> = {
  CAD: 1,
  USD: 0.74,
  EUR: 0.68,
  BRL: 3.70,
  MXN: 12.50,
  CHF: 0.65,
  GBP: 0.58,
  AUD: 1.12,
  JPY: 110.50,
  CNY: 5.35,
  INR: 61.50,
  KRW: 980.00,
  SGD: 1.00,
  HKD: 5.78,
  NZD: 1.22,
  SEK: 7.85,
  NOK: 7.95,
  DKK: 5.08,
  PLN: 2.95,
  ZAR: 13.80,
  AED: 2.72,
  SAR: 2.78,
  THB: 26.50,
  MYR: 3.45,
  PHP: 41.20,
  COP: 2950.00,
  CLP: 680.00,
  ARS: 650.00,
};

export const currencySymbols: Record<ExtendedCurrency, string> = {
  CAD: 'CA$',
  USD: 'US$',
  EUR: '€',
  BRL: 'R$',
  MXN: 'MX$',
  CHF: 'CHF',
  GBP: '£',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  ZAR: 'R',
  AED: 'د.إ',
  SAR: '﷼',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  COP: 'COL$',
  CLP: 'CLP$',
  ARS: 'AR$',
};

export const currencyDecimals: Record<ExtendedCurrency, number> = {
  CAD: 2, USD: 2, EUR: 2, BRL: 2, MXN: 2, CHF: 2, GBP: 2,
  AUD: 2, NZD: 2, SGD: 2, HKD: 2, ZAR: 2, AED: 2, SAR: 2,
  THB: 2, MYR: 2, PHP: 2, PLN: 2, SEK: 2, NOK: 2, DKK: 2,
  INR: 2, CNY: 2, 
  JPY: 0, KRW: 0, COP: 0, CLP: 0, ARS: 0,
};

// Community categories
export const communityCategories = [
  { id: 'Travel', icon: 'Compass', color: 'primary' },
  { id: 'Vehicle', icon: 'Car', color: 'blue' },
  { id: 'Real Estate', icon: 'Home', color: 'green' },
  { id: 'Education', icon: 'GraduationCap', color: 'purple' },
  { id: 'Technology', icon: 'Laptop', color: 'cyan' },
  { id: 'Health', icon: 'Heart', color: 'red' },
  { id: 'Investment', icon: 'TrendingUp', color: 'emerald' },
  { id: 'Emergency', icon: 'Shield', color: 'orange' },
  { id: 'Wedding', icon: 'Heart', color: 'pink' },
  { id: 'Retirement', icon: 'Sunset', color: 'amber' },
  { id: 'Family', icon: 'Users', color: 'indigo' },
  { id: 'Hobby', icon: 'Sparkles', color: 'violet' },
];

// Achievement badges
export interface Badge {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  requirement: { type: 'streak' | 'contributions' | 'amount' | 'groups' | 'level' | 'premium'; value: number };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'vip';
  premiumOnly?: boolean;
}

export const badges: Badge[] = [
  {
    id: 'first_step',
    name: { en: 'First Step', pt: 'Primeiro Passo', es: 'Primer Paso', fr: 'Premier Pas', it: 'Primo Passo', de: 'Erster Schritt' },
    description: { en: 'Made your first contribution', pt: 'Fez sua primeira contribuição', es: 'Hiciste tu primera contribución', fr: 'Première contribution', it: 'Prima contribuzione', de: 'Erste Beiträge' },
    icon: '🌱',
    requirement: { type: 'contributions', value: 1 },
    tier: 'bronze',
  },
  {
    id: 'consistent_saver',
    name: { en: 'Consistent Saver', pt: 'Poupador Consistente', es: 'Ahorrador Consistente', fr: 'Épargnant Régulier', it: 'Risparmiatore Costante', de: 'Konsequenter Sparer' },
    description: { en: '7-day streak', pt: 'Streak de 7 dias', es: 'Racha de 7 días', fr: 'Série de 7 jours', it: 'Serie di 7 giorni', de: '7-Tage-Serie' },
    icon: '🔥',
    requirement: { type: 'streak', value: 7 },
    tier: 'bronze',
  },
  {
    id: 'habit_builder',
    name: { en: 'Habit Builder', pt: 'Construtor de Hábitos', es: 'Constructor de Hábitos', fr: 'Bâtisseur d\'Habitudes', it: 'Costruttore di Abitudini', de: 'Gewohnheitsbildner' },
    description: { en: '30-day streak', pt: 'Streak de 30 dias', es: 'Racha de 30 días', fr: 'Série de 30 jours', it: 'Serie di 30 giorni', de: '30-Tage-Serie' },
    icon: '💪',
    requirement: { type: 'streak', value: 30 },
    tier: 'silver',
  },
  {
    id: 'century_saver',
    name: { en: 'Century Saver', pt: 'Poupador Centenário', es: 'Ahorrador Centenario', fr: 'Épargnant Centenaire', it: 'Risparmiatore Centenario', de: 'Jahrhundert-Sparer' },
    description: { en: '100-day streak', pt: 'Streak de 100 dias', es: 'Racha de 100 días', fr: 'Série de 100 jours', it: 'Serie di 100 giorni', de: '100-Tage-Serie' },
    icon: '🏆',
    requirement: { type: 'streak', value: 100 },
    tier: 'gold',
  },
  {
    id: 'team_player',
    name: { en: 'Team Player', pt: 'Jogador de Equipe', es: 'Jugador de Equipo', fr: 'Joueur d\'Équipe', it: 'Giocatore di Squadra', de: 'Teamspieler' },
    description: { en: 'Join 3 groups', pt: 'Entre em 3 grupos', es: 'Únete a 3 grupos', fr: 'Rejoindre 3 groupes', it: 'Unisciti a 3 gruppi', de: '3 Gruppen beitreten' },
    icon: '🤝',
    requirement: { type: 'groups', value: 3 },
    tier: 'bronze',
  },
  {
    id: 'thousand_club',
    name: { en: 'Thousand Club', pt: 'Clube dos Mil', es: 'Club de los Mil', fr: 'Club des Mille', it: 'Club dei Mille', de: 'Tausender-Club' },
    description: { en: 'Save $1,000 total', pt: 'Economize $1.000 no total', es: 'Ahorra $1,000 en total', fr: 'Économisez 1 000 $', it: 'Risparmia 1.000 $', de: '1.000 $ sparen' },
    icon: '💰',
    requirement: { type: 'amount', value: 1000 },
    tier: 'silver',
  },
  {
    id: 'five_k_club',
    name: { en: '$5K Club', pt: 'Clube dos $5K', es: 'Club de los $5K', fr: 'Club des 5K$', it: 'Club dei 5K$', de: '5K$-Club' },
    description: { en: 'Save $5,000 total', pt: 'Economize $5.000 no total', es: 'Ahorra $5,000 en total', fr: 'Économisez 5 000 $', it: 'Risparmia 5.000 $', de: '5.000 $ sparen' },
    icon: '💎',
    requirement: { type: 'amount', value: 5000 },
    tier: 'gold',
  },
  {
    id: 'ten_k_club',
    name: { en: '$10K Club', pt: 'Clube dos $10K', es: 'Club de los $10K', fr: 'Club des 10K$', it: 'Club dei 10K$', de: '10K$-Club' },
    description: { en: 'Save $10,000 total', pt: 'Economize $10.000 no total', es: 'Ahorra $10,000 en total', fr: 'Économisez 10 000 $', it: 'Risparmia 10.000 $', de: '10.000 $ sparen' },
    icon: '👑',
    requirement: { type: 'amount', value: 10000 },
    tier: 'platinum',
  },
  {
    id: 'billionaire_mindset',
    name: { en: 'Billionaire Mindset', pt: 'Mentalidade Bilionária', es: 'Mentalidad de Multimillonario', fr: 'Mentalité de Milliardaire', it: 'Mentalità da Miliardario', de: 'Milliardärs-Mentalität' },
    description: { en: 'Reach Level 10', pt: 'Alcance o Nível 10', es: 'Alcanza el Nivel 10', fr: 'Atteindre le Niveau 10', it: 'Raggiungi il Livello 10', de: 'Level 10 erreichen' },
    icon: '🚀',
    requirement: { type: 'level', value: 10 },
    tier: 'diamond',
  },
  {
    id: 'deposit_master',
    name: { en: 'Deposit Master', pt: 'Mestre dos Depósitos', es: 'Maestro de Depósitos', fr: 'Maître des Dépôts', it: 'Maestro dei Depositi', de: 'Einzahlungsmeister' },
    description: { en: '50 contributions', pt: '50 contribuições', es: '50 contribuciones', fr: '50 contributions', it: '50 contribuzioni', de: '50 Beiträge' },
    icon: '⭐',
    requirement: { type: 'contributions', value: 50 },
    tier: 'silver',
  },
  {
    id: 'legend',
    name: { en: 'Legend', pt: 'Lenda', es: 'Leyenda', fr: 'Légende', it: 'Leggenda', de: 'Legende' },
    description: { en: '365-day streak', pt: 'Streak de 365 dias', es: 'Racha de 365 días', fr: 'Série de 365 jours', it: 'Serie di 365 giorni', de: '365-Tage-Serie' },
    icon: '🌟',
    requirement: { type: 'streak', value: 365 },
    tier: 'diamond',
  },
  // Premium-exclusive badges
  {
    id: 'vip_member',
    name: { en: 'VIP Member', pt: 'Membro VIP', es: 'Miembro VIP', fr: 'Membre VIP', it: 'Membro VIP', de: 'VIP-Mitglied' },
    description: { en: 'Premium subscriber', pt: 'Assinante Premium', es: 'Suscriptor Premium', fr: 'Abonné Premium', it: 'Abbonato Premium', de: 'Premium-Abonnent' },
    icon: '👑',
    requirement: { type: 'premium', value: 1 },
    tier: 'vip',
    premiumOnly: true,
  },
  {
    id: 'vip_saver',
    name: { en: 'VIP Saver', pt: 'Poupador VIP', es: 'Ahorrador VIP', fr: 'Épargnant VIP', it: 'Risparmiatore VIP', de: 'VIP-Sparer' },
    description: { en: 'Save $500 as VIP', pt: 'Economize $500 como VIP', es: 'Ahorra $500 como VIP', fr: 'Économisez 500$ en VIP', it: 'Risparmia 500$ da VIP', de: '500$ als VIP sparen' },
    icon: '💫',
    requirement: { type: 'amount', value: 500 },
    tier: 'vip',
    premiumOnly: true,
  },
  {
    id: 'vip_streak',
    name: { en: 'VIP Streak', pt: 'Streak VIP', es: 'Racha VIP', fr: 'Série VIP', it: 'Serie VIP', de: 'VIP-Serie' },
    description: { en: '14-day streak as VIP', pt: 'Streak de 14 dias como VIP', es: 'Racha de 14 días como VIP', fr: 'Série de 14 jours en VIP', it: 'Serie di 14 giorni da VIP', de: '14-Tage-Serie als VIP' },
    icon: '🔱',
    requirement: { type: 'streak', value: 14 },
    tier: 'vip',
    premiumOnly: true,
  },
];

export const tierColors = {
  bronze: { bg: 'bg-amber-600/20', text: 'text-amber-600', border: 'border-amber-600/30' },
  silver: { bg: 'bg-slate-400/20', text: 'text-slate-400', border: 'border-slate-400/30' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  platinum: { bg: 'bg-cyan-400/20', text: 'text-cyan-400', border: 'border-cyan-400/30' },
  diamond: { bg: 'bg-purple-400/20', text: 'text-purple-400', border: 'border-purple-400/30' },
  vip: { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/40' },
};
