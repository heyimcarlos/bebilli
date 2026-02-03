import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'fr';
type Currency = 'BRL' | 'USD' | 'EUR' | 'CAD';

interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  gender: 'M' | 'F' | 'O';
  avatar?: string;
  isPremium: boolean;
  consistencyDays: number;
  maxSaved: number;
  totalBalance: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  image: string;
  goal: number;
  current: number;
  members: GroupMember[];
  messages: ChatMessage[];
  inviteCode: string;
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  contribution: number;
  lastContribution: Date;
  rank: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  isBot?: boolean;
}

interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  category: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  communities: Community[];
  formatCurrency: (value: number) => string;
  convertCurrency: (value: number) => number;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    welcome: 'Bem-vindo',
    billionaire: 'Bilionário',
    billionaires: 'Bilionários',
    totalBalance: 'Saldo Total',
    myGroups: 'Meus Grupos',
    createGroup: 'Criar Novo Grupo',
    enterCode: 'Entrar com Código',
    timeline: 'Comunidades',
    profile: 'Perfil',
    home: 'Início',
    group: 'Grupo',
    ranking: 'Ranking',
    chat: 'Chat',
    dreamPanel: 'Painel do Sonho',
    progress: 'Progresso',
    contribute: 'Contribuir',
    join: 'Participar',
    settings: 'Configurações',
    language: 'Idioma',
    currency: 'Moeda',
    premium: 'Premium',
    consistencyDays: 'Dias de Consistência',
    maxSaved: 'Máximo Economizado',
    scanReceipt: 'Escanear Comprovante',
    aiDetected: 'IA detectou aporte de',
    rankingUpdated: 'Ranking atualizado!',
    partners: 'Parceiros',
    unlockAt: 'Desbloqueia em',
    postAchievement: 'Postar Conquista',
    groupGoal: 'Meta do Grupo',
    yourContribution: 'Sua Contribuição',
    login: 'Entrar',
    signup: 'Cadastrar',
    name: 'Nome',
    email: 'E-mail',
    country: 'País',
    gender: 'Sexo',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    hideBalance: 'Ocultar saldo',
    showBalance: 'Mostrar saldo',
    justContributed: 'acabou de contribuir',
    noContributions: 'Sem contribuições há',
    days: 'dias',
    members: 'membros',
    of: 'de',
    reached: 'alcançado',
    inviteFriends: 'Convidar Amigos',
    inviteCode: 'Código de Convite',
    inviteLink: 'Link de Convite',
    shareOn: 'Compartilhar em',
    codeCopied: 'Código copiado!',
    linkCopied: 'Link copiado!',
    shareWithFriends: 'Compartilhe com seus amigos!',
    more: 'Mais',
    enterCodeDescription: 'Digite o código de 6 dígitos do grupo',
    joinGroup: 'Entrar no Grupo',
    joinedGroup: 'Você entrou no grupo!',
    invalidCode: 'Código inválido. Tente novamente.',
    demoCodes: 'Códigos demo',
    shareGroup: 'Compartilhar Grupo',
    notifications: 'Notificações',
    enableNotifications: 'Ativar notificações',
    enableNotificationsDesc: 'Receba alertas quando membros do seu grupo fizerem contribuições.',
    enable: 'Ativar',
    markAllRead: 'Marcar todas como lidas',
    clearAll: 'Limpar todas',
    noNotifications: 'Nenhuma notificação',
    newContribution: 'Nova contribuição!',
    contributedTo: 'contribuiu para',
  },
  en: {
    welcome: 'Welcome',
    billionaire: 'Billionaire',
    billionaires: 'Billionaires',
    totalBalance: 'Total Balance',
    myGroups: 'My Groups',
    createGroup: 'Create New Group',
    enterCode: 'Enter with Code',
    timeline: 'Communities',
    profile: 'Profile',
    home: 'Home',
    group: 'Group',
    ranking: 'Ranking',
    chat: 'Chat',
    dreamPanel: 'Dream Panel',
    progress: 'Progress',
    contribute: 'Contribute',
    join: 'Join',
    settings: 'Settings',
    language: 'Language',
    currency: 'Currency',
    premium: 'Premium',
    consistencyDays: 'Consistency Days',
    maxSaved: 'Max Saved',
    scanReceipt: 'Scan Receipt',
    aiDetected: 'AI detected contribution of',
    rankingUpdated: 'Ranking updated!',
    partners: 'Partners',
    unlockAt: 'Unlocks at',
    postAchievement: 'Post Achievement',
    groupGoal: 'Group Goal',
    yourContribution: 'Your Contribution',
    login: 'Login',
    signup: 'Sign Up',
    name: 'Name',
    email: 'Email',
    country: 'Country',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    hideBalance: 'Hide balance',
    showBalance: 'Show balance',
    justContributed: 'just contributed',
    noContributions: 'No contributions for',
    days: 'days',
    members: 'members',
    of: 'of',
    reached: 'reached',
    inviteFriends: 'Invite Friends',
    inviteCode: 'Invite Code',
    inviteLink: 'Invite Link',
    shareOn: 'Share on',
    codeCopied: 'Code copied!',
    linkCopied: 'Link copied!',
    shareWithFriends: 'Share with your friends!',
    more: 'More',
    enterCodeDescription: 'Enter the 6-digit group code',
    joinGroup: 'Join Group',
    joinedGroup: 'You joined the group!',
    invalidCode: 'Invalid code. Try again.',
    demoCodes: 'Demo codes',
    shareGroup: 'Share Group',
    notifications: 'Notifications',
    enableNotifications: 'Enable notifications',
    enableNotificationsDesc: 'Get alerts when group members make contributions.',
    enable: 'Enable',
    markAllRead: 'Mark all as read',
    clearAll: 'Clear all',
    noNotifications: 'No notifications',
    newContribution: 'New contribution!',
    contributedTo: 'contributed to',
  },
  fr: {
    welcome: 'Bienvenue',
    billionaire: 'Milliardaire',
    billionaires: 'Milliardaires',
    totalBalance: 'Solde Total',
    myGroups: 'Mes Groupes',
    createGroup: 'Créer un Groupe',
    enterCode: 'Entrer avec Code',
    timeline: 'Communautés',
    profile: 'Profil',
    home: 'Accueil',
    group: 'Groupe',
    ranking: 'Classement',
    chat: 'Chat',
    dreamPanel: 'Panneau du Rêve',
    progress: 'Progrès',
    contribute: 'Contribuer',
    join: 'Rejoindre',
    settings: 'Paramètres',
    language: 'Langue',
    currency: 'Devise',
    premium: 'Premium',
    consistencyDays: 'Jours de Constance',
    maxSaved: 'Max Économisé',
    scanReceipt: 'Scanner Reçu',
    aiDetected: 'IA a détecté une contribution de',
    rankingUpdated: 'Classement mis à jour!',
    partners: 'Partenaires',
    unlockAt: 'Débloque à',
    postAchievement: 'Poster Réussite',
    groupGoal: 'Objectif du Groupe',
    yourContribution: 'Votre Contribution',
    login: 'Connexion',
    signup: 'Inscription',
    name: 'Nom',
    email: 'E-mail',
    country: 'Pays',
    gender: 'Sexe',
    male: 'Masculin',
    female: 'Féminin',
    other: 'Autre',
    hideBalance: 'Masquer solde',
    showBalance: 'Afficher solde',
    justContributed: 'vient de contribuer',
    noContributions: 'Pas de contributions depuis',
    days: 'jours',
    members: 'membres',
    of: 'de',
    reached: 'atteint',
    inviteFriends: 'Inviter des Amis',
    inviteCode: 'Code d\'Invitation',
    inviteLink: 'Lien d\'Invitation',
    shareOn: 'Partager sur',
    codeCopied: 'Code copié!',
    linkCopied: 'Lien copié!',
    shareWithFriends: 'Partagez avec vos amis!',
    more: 'Plus',
    enterCodeDescription: 'Entrez le code à 6 chiffres du groupe',
    joinGroup: 'Rejoindre le Groupe',
    joinedGroup: 'Vous avez rejoint le groupe!',
    invalidCode: 'Code invalide. Réessayez.',
    demoCodes: 'Codes démo',
    shareGroup: 'Partager le Groupe',
    notifications: 'Notifications',
    enableNotifications: 'Activer les notifications',
    enableNotificationsDesc: 'Recevez des alertes lorsque les membres font des contributions.',
    enable: 'Activer',
    markAllRead: 'Tout marquer comme lu',
    clearAll: 'Tout effacer',
    noNotifications: 'Aucune notification',
    newContribution: 'Nouvelle contribution!',
    contributedTo: 'a contribué à',
  },
};

const currencyRates: Record<Currency, number> = {
  BRL: 1,
  USD: 0.20,
  EUR: 0.18,
  CAD: 0.27,
};

const currencySymbols: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  CAD: 'C$',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Expedição Japão 🇯🇵',
      description: 'Juntos para conhecer a Terra do Sol Nascente',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      goal: 50000,
      current: 32500,
      members: [
        { id: '1', name: 'Lucas Silva', contribution: 8500, lastContribution: new Date(), rank: 1 },
        { id: '2', name: 'Maria Santos', contribution: 7200, lastContribution: new Date(Date.now() - 86400000), rank: 2 },
        { id: '3', name: 'Pedro Oliveira', contribution: 6800, lastContribution: new Date(Date.now() - 172800000), rank: 3 },
        { id: '4', name: 'Ana Costa', contribution: 5500, lastContribution: new Date(Date.now() - 604800000 * 2), rank: 4 },
        { id: '5', name: 'João Mendes', contribution: 4500, lastContribution: new Date(Date.now() - 604800000 * 3), rank: 5 },
      ],
      messages: [
        { id: '1', userId: 'bot', userName: 'Bili Bot', content: 'Bilionário Lucas acabou de contribuir R$ 500!', timestamp: new Date(), isBot: true },
        { id: '2', userId: '2', userName: 'Maria Santos', content: 'Vamos conseguir! 🚀', timestamp: new Date(Date.now() - 3600000) },
      ],
      inviteCode: 'JAPAO1',
    },
    {
      id: '2',
      name: 'Garagem BYD 🚗',
      description: 'Nosso carro elétrico sustentável',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      goal: 150000,
      current: 45000,
      members: [
        { id: '1', name: 'Carlos Ferreira', contribution: 15000, lastContribution: new Date(), rank: 1 },
        { id: '2', name: 'Beatriz Lima', contribution: 12000, lastContribution: new Date(Date.now() - 86400000), rank: 2 },
        { id: '3', name: 'Rafael Souza', contribution: 10000, lastContribution: new Date(Date.now() - 604800000 * 2), rank: 3 },
        { id: '4', name: 'Juliana Alves', contribution: 8000, lastContribution: new Date(Date.now() - 604800000 * 3), rank: 4 },
      ],
      messages: [],
      inviteCode: 'BYDCAR',
    },
  ]);

  const [communities] = useState<Community[]>([
    {
      id: '1',
      name: 'Expedição Japão',
      description: 'Realize o sonho de conhecer o Japão',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      members: 1247,
      category: 'Viagem',
    },
    {
      id: '2',
      name: 'Garagem BYD',
      description: 'Mobilidade elétrica sustentável',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      members: 892,
      category: 'Veículo',
    },
    {
      id: '3',
      name: 'Viver no Rio',
      description: 'Seu apartamento na cidade maravilhosa',
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      members: 2134,
      category: 'Imóvel',
    },
    {
      id: '4',
      name: 'MBA Harvard',
      description: 'Educação de elite para sua carreira',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      members: 567,
      category: 'Educação',
    },
  ]);

  const convertCurrency = (value: number): number => {
    return value * currencyRates[currency];
  };

  const formatCurrency = (value: number): string => {
    const converted = convertCurrency(value);
    return `${currencySymbols[currency]} ${converted.toLocaleString(language === 'pt' ? 'pt-BR' : language === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        user,
        setUser,
        groups,
        setGroups,
        communities,
        formatCurrency,
        convertCurrency,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
