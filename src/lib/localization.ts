// Localization support - focused markets

export type ExtendedCurrency = 'CAD' | 'USD' | 'BRL' | 'EUR';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: ExtendedCurrency;
  locale: string;
  language: string;
}

export const countries: Country[] = [
  // Portuguese
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', locale: 'pt-BR', language: 'pt' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', locale: 'pt-PT', language: 'pt' },
  // English
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', locale: 'en-CA', language: 'en' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US', language: 'en' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'USD', locale: 'en-GB', language: 'en' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'USD', locale: 'en-AU', language: 'en' },
  // French
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', locale: 'fr-FR', language: 'fr' },
  { code: 'QC', name: 'Québec', flag: '🇨🇦', currency: 'CAD', locale: 'fr-CA', language: 'fr' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', currency: 'EUR', locale: 'fr-BE', language: 'fr' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', currency: 'EUR', locale: 'fr-CH', language: 'fr' },
  // Spanish
  { code: 'MX', name: 'México', flag: '🇲🇽', currency: 'USD', locale: 'es-MX', language: 'es' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'USD', locale: 'es-AR', language: 'es' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'USD', locale: 'es-CO', language: 'es' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'USD', locale: 'es-CL', language: 'es' },
  { code: 'ES', name: 'España', flag: '🇪🇸', currency: 'EUR', locale: 'es-ES', language: 'es' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'USD', locale: 'es-PE', language: 'es' },
];

export const getCountriesByLanguage = (lang: string): Country[] => {
  return countries.filter(c => c.language === lang);
};

export const currencyRates: Record<ExtendedCurrency, number> = {
  CAD: 1,
  USD: 0.74,
  BRL: 3.70,
  EUR: 0.68,
};

export const currencySymbols: Record<ExtendedCurrency, string> = {
  CAD: 'CA$',
  USD: 'US$',
  BRL: 'R$',
  EUR: '€',
};

export const currencyDecimals: Record<ExtendedCurrency, number> = {
  CAD: 2, USD: 2, BRL: 2, EUR: 2,
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

// New badge system - 4 languages
export interface Badge {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  requirement: { type: 'streak' | 'contributions' | 'amount' | 'groups' | 'level' | 'premium' | 'goal_complete' | 'goal_half' | 'competition_win' | 'travel_group' | 'ahead_of_schedule'; value: number };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'vip';
  premiumOnly?: boolean;
}

export const badges: Badge[] = [
  {
    id: 'first_step',
    name: { pt: 'Primeiro Passo', en: 'First Step', fr: 'Premier Pas', es: 'Primer Paso' },
    description: { pt: 'Fez seu primeiro aporte', en: 'First contribution uploaded', fr: 'Première contribution', es: 'Primer aporte registrado' },
    icon: '🥇',
    requirement: { type: 'contributions', value: 1 },
    tier: 'bronze',
  },
  {
    id: 'on_fire',
    name: { pt: 'Na Chama', en: 'On Fire', fr: 'En Feu', es: 'En Llamas' },
    description: { pt: '3 meses contribuindo seguidos', en: '3 months contributing in a row', fr: '3 mois consécutifs', es: '3 meses seguidos contribuyendo' },
    icon: '🔥',
    requirement: { type: 'streak', value: 90 },
    tier: 'gold',
  },
  {
    id: 'halfway',
    name: { pt: 'Na Metade', en: 'Halfway There', fr: 'À Mi-Chemin', es: 'A Mitad' },
    description: { pt: 'Grupo atingiu 50% da meta', en: 'Group reached 50% of goal', fr: 'Groupe à 50% de l\'objectif', es: 'Grupo alcanzó 50% de la meta' },
    icon: '🌓',
    requirement: { type: 'goal_half', value: 50 },
    tier: 'silver',
  },
  {
    id: 'goal_crusher',
    name: { pt: 'Meta Batida', en: 'Goal Crusher', fr: 'Objectif Atteint', es: 'Meta Cumplida' },
    description: { pt: 'Grupo completou a meta', en: 'Group completed goal', fr: 'Groupe a atteint l\'objectif', es: 'Grupo completó la meta' },
    icon: '🏆',
    requirement: { type: 'goal_complete', value: 100 },
    tier: 'platinum',
  },
  {
    id: 'top_saver',
    name: { pt: 'Top Poupadora', en: 'Top Saver', fr: 'Meilleure Épargnante', es: 'Top Ahorradora' },
    description: { pt: 'Ganhou competição mensal', en: 'Won monthly competition', fr: 'A gagné la compétition mensuelle', es: 'Ganó la competencia mensual' },
    icon: '👑',
    requirement: { type: 'competition_win', value: 1 },
    tier: 'diamond',
  },
  {
    id: 'explorer',
    name: { pt: 'Exploradora', en: 'Explorer', fr: 'Exploratrice', es: 'Exploradora' },
    description: { pt: 'Criou grupo de viagem', en: 'Created a travel goal group', fr: 'A créé un groupe voyage', es: 'Creó un grupo de viaje' },
    icon: '🌍',
    requirement: { type: 'travel_group', value: 1 },
    tier: 'silver',
  },
  {
    id: 'team_player',
    name: { pt: 'Trabalho em Equipe', en: 'Team Player', fr: 'Esprit d\'Équipe', es: 'Trabajo en Equipo' },
    description: { pt: 'Entrou em 3 grupos diferentes', en: 'Joined 3 different groups', fr: 'A rejoint 3 groupes', es: 'Se unió a 3 grupos diferentes' },
    icon: '🤝',
    requirement: { type: 'groups', value: 3 },
    tier: 'bronze',
  },
  {
    id: 'ahead_of_schedule',
    name: { pt: 'Adiantada', en: 'Ahead of Schedule', fr: 'En Avance', es: 'Adelantada' },
    description: { pt: 'Grupo bateu a meta antes do prazo', en: 'Group hit goal before deadline', fr: 'Groupe a atteint l\'objectif avant la date', es: 'Grupo alcanzó la meta antes del plazo' },
    icon: '💎',
    requirement: { type: 'ahead_of_schedule', value: 1 },
    tier: 'diamond',
  },
  // Legacy/extra badges kept
  {
    id: 'vip_member',
    name: { pt: 'Membro VIP', en: 'VIP Member', fr: 'Membre VIP', es: 'Miembro VIP' },
    description: { pt: 'Assinante Premium', en: 'Premium subscriber', fr: 'Abonné Premium', es: 'Suscriptor Premium' },
    icon: '👑',
    requirement: { type: 'premium', value: 1 },
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

// Premium pricing - fixed per region
export const premiumPricing: Record<ExtendedCurrency, { monthly: number; symbol: string; label: string }> = {
  BRL: { monthly: 9.90, symbol: 'R$', label: 'R$ 9,90/mês' },
  CAD: { monthly: 5.90, symbol: 'CA$', label: 'CA$ 5,90/month' },
  USD: { monthly: 4.00, symbol: 'US$', label: 'US$ 4,00/month' },
  EUR: { monthly: 3.90, symbol: '€', label: '€ 3,90/mois' },
};

// Brand taglines
export const taglines: Record<string, string> = {
  pt: 'Junte. Poupe. Conquiste.',
  en: 'Save together. Win together.',
  fr: 'Épargnez. Gagnez. Ensemble.',
  es: 'Ahorra. Gana. Juntas.',
};
