// Localization support - focused markets

export type ExtendedCurrency = 'CAD' | 'USD' | 'BRL';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: ExtendedCurrency;
  locale: string;
}

export const countries: Country[] = [
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', locale: 'pt-BR' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', locale: 'en-CA' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'USD', locale: 'fr-FR' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'USD', locale: 'es-MX' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'USD', locale: 'es-ES' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'USD', locale: 'es-AR' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'USD', locale: 'es-CO' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'USD', locale: 'es-CL' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'USD', locale: 'pt-PT' },
];

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
};

export const currencyDecimals: Record<ExtendedCurrency, number> = {
  CAD: 2, USD: 2, EUR: 2, BRL: 2, MXN: 2, CHF: 2, GBP: 2,
  AUD: 2,
  JPY: 0,
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
    name: { en: 'First Step', pt: 'Primeiro Passo', fr: 'Premier Pas' },
    description: { en: 'Made your first contribution', pt: 'Fez sua primeira contribuição', fr: 'Première contribution' },
    icon: '🌱',
    requirement: { type: 'contributions', value: 1 },
    tier: 'bronze',
  },
  {
    id: 'consistent_saver',
    name: { en: 'Consistent Saver', pt: 'Poupador Consistente', fr: 'Épargnant Régulier' },
    description: { en: '7-day streak', pt: 'Streak de 7 dias', fr: 'Série de 7 jours' },
    icon: '🔥',
    requirement: { type: 'streak', value: 7 },
    tier: 'bronze',
  },
  {
    id: 'habit_builder',
    name: { en: 'Habit Builder', pt: 'Construtor de Hábitos', fr: 'Bâtisseur d\'Habitudes' },
    description: { en: '30-day streak', pt: 'Streak de 30 dias', fr: 'Série de 30 jours' },
    icon: '💪',
    requirement: { type: 'streak', value: 30 },
    tier: 'silver',
  },
  {
    id: 'century_saver',
    name: { en: 'Century Saver', pt: 'Poupador Centenário', fr: 'Épargnant Centenaire' },
    description: { en: '100-day streak', pt: 'Streak de 100 dias', fr: 'Série de 100 jours' },
    icon: '🏆',
    requirement: { type: 'streak', value: 100 },
    tier: 'gold',
  },
  {
    id: 'team_player',
    name: { en: 'Team Player', pt: 'Jogador de Equipe', fr: 'Joueur d\'Équipe' },
    description: { en: 'Join 3 groups', pt: 'Entre em 3 grupos', fr: 'Rejoindre 3 groupes' },
    icon: '🤝',
    requirement: { type: 'groups', value: 3 },
    tier: 'bronze',
  },
  {
    id: 'thousand_club',
    name: { en: 'Thousand Club', pt: 'Clube dos Mil', fr: 'Club des Mille' },
    description: { en: 'Save $1,000 total', pt: 'Economize $1.000 no total', fr: 'Économisez 1 000 $' },
    icon: '💰',
    requirement: { type: 'amount', value: 1000 },
    tier: 'silver',
  },
  {
    id: 'five_k_club',
    name: { en: '$5K Club', pt: 'Clube dos $5K', fr: 'Club des 5K$' },
    description: { en: 'Save $5,000 total', pt: 'Economize $5.000 no total', fr: 'Économisez 5 000 $' },
    icon: '💎',
    requirement: { type: 'amount', value: 5000 },
    tier: 'gold',
  },
  {
    id: 'ten_k_club',
    name: { en: '$10K Club', pt: 'Clube dos $10K', fr: 'Club des 10K$' },
    description: { en: 'Save $10,000 total', pt: 'Economize $10.000 no total', fr: 'Économisez 10 000 $' },
    icon: '👑',
    requirement: { type: 'amount', value: 10000 },
    tier: 'platinum',
  },
  {
    id: 'billionaire_mindset',
    name: { en: 'Billionaire Mindset', pt: 'Mentalidade Bilionária', fr: 'Mentalité de Milliardaire' },
    description: { en: 'Reach Level 10', pt: 'Alcance o Nível 10', fr: 'Atteindre le Niveau 10' },
    icon: '🚀',
    requirement: { type: 'level', value: 10 },
    tier: 'diamond',
  },
  {
    id: 'deposit_master',
    name: { en: 'Deposit Master', pt: 'Mestre dos Depósitos', fr: 'Maître des Dépôts' },
    description: { en: '50 contributions', pt: '50 contribuições', fr: '50 contributions' },
    icon: '⭐',
    requirement: { type: 'contributions', value: 50 },
    tier: 'silver',
  },
  {
    id: 'legend',
    name: { en: 'Legend', pt: 'Lenda', fr: 'Légende' },
    description: { en: '365-day streak', pt: 'Streak de 365 dias', fr: 'Série de 365 jours' },
    icon: '🌟',
    requirement: { type: 'streak', value: 365 },
    tier: 'diamond',
  },
  {
    id: 'vip_member',
    name: { en: 'VIP Member', pt: 'Membro VIP', fr: 'Membre VIP' },
    description: { en: 'Premium subscriber', pt: 'Assinante Premium', fr: 'Abonné Premium' },
    icon: '👑',
    requirement: { type: 'premium', value: 1 },
    tier: 'vip',
    premiumOnly: true,
  },
  {
    id: 'vip_saver',
    name: { en: 'VIP Saver', pt: 'Poupador VIP', fr: 'Épargnant VIP' },
    description: { en: 'Save $500 as VIP', pt: 'Economize $500 como VIP', fr: 'Économisez 500$ en VIP' },
    icon: '💫',
    requirement: { type: 'amount', value: 500 },
    tier: 'vip',
    premiumOnly: true,
  },
  {
    id: 'vip_streak',
    name: { en: 'VIP Streak', pt: 'Streak VIP', fr: 'Série VIP' },
    description: { en: '14-day streak as VIP', pt: 'Streak de 14 dias como VIP', fr: 'Série de 14 jours en VIP' },
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
