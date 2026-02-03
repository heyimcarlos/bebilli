import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'fr';
export type Currency = 'BRL' | 'USD' | 'EUR' | 'CAD';

const STORAGE_KEY_LANGUAGE = 'billi-language';
const STORAGE_KEY_CURRENCY = 'billi-currency';

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
    continue: 'Continuar',
    installApp: 'Instalar Billi',
    installDescription: 'Adicione o app à sua tela inicial para acesso rápido e offline.',
    installNow: 'Instalar Agora',
    installOnIOS: 'Instalar no iPhone',
    tapShare: 'Toque em Compartilhar',
    tapShareDesc: 'Na barra inferior do Safari',
    addToHomeScreen: 'Adicionar à Tela Inicial',
    addToHomeScreenDesc: 'Role e toque na opção',
    understood: 'Entendi',
    // New translations
    groupPhoto: 'Foto do Grupo',
    addPhotoForGroup: 'Adicione uma foto para o grupo',
    groupName: 'Nome do Grupo',
    groupNamePlaceholder: 'Ex: Viagem para Paris',
    goalAmount: 'Meta',
    description: 'Descrição',
    descriptionOptional: 'Descrição (opcional)',
    descriptionPlaceholder: 'Descreva o objetivo do grupo...',
    createGroupButton: 'Criar Grupo',
    error: 'Erro',
    groupCreated: 'Grupo criado!',
    groupCreatedDesc: 'está pronto para receber contribuições.',
    noGroupsYet: 'Você ainda não tem grupos.',
    createOrJoin: 'Crie um novo grupo ou entre com um código de convite!',
    activeGroups: 'grupos ativos',
    signOut: 'Sair',
    subscribePremium: 'Assinar Premium',
    perMonth: '/mês',
    password: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    noAccount: 'Não tem conta?',
    hasAccount: 'Já tem conta?',
    signUpNow: 'Cadastre-se',
    signInNow: 'Entre',
    welcomeBack: 'Bem-vindo de volta',
    createAccount: 'Criar conta',
    enterEmail: 'Digite seu e-mail',
    enterPassword: 'Digite sua senha',
    enterName: 'Digite seu nome',
    selectCountry: 'Selecione seu país',
    hello: 'Olá',
    youUser: '(você)',
    noMembersYet: 'Sem membros ainda. Convide seus amigos!',
    welcomeToGroup: 'Bem-vindo ao',
    startContributing: 'Comece a contribuir e convide amigos!',
    quickContribution: 'Contribuição rápida',
    customAmount: 'Valor personalizado',
    enterAmount: 'Digite o valor',
    confirmContribution: 'Confirmar contribuição',
    contributionSuccess: 'Contribuição realizada!',
    addedToGroup: 'adicionados ao grupo',
    streakDay: 'dia de streak',
    streakDays: 'dias de streak',
    phone: 'Telefone',
    city: 'Cidade',
    cityPlaceholder: 'Toronto',
    checkEmail: 'Verifique seu e-mail',
    confirmationSent: 'Enviamos um link de confirmação para verificar sua conta.',
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
    continue: 'Continue',
    installApp: 'Install Billi',
    installDescription: 'Add the app to your home screen for quick and offline access.',
    installNow: 'Install Now',
    installOnIOS: 'Install on iPhone',
    tapShare: 'Tap Share',
    tapShareDesc: 'On Safari\'s bottom bar',
    addToHomeScreen: 'Add to Home Screen',
    addToHomeScreenDesc: 'Scroll down and tap the option',
    understood: 'Got it',
    // New translations
    groupPhoto: 'Group Photo',
    addPhotoForGroup: 'Add a photo for your group',
    groupName: 'Group Name',
    groupNamePlaceholder: 'Ex: Trip to Paris',
    goalAmount: 'Goal',
    description: 'Description',
    descriptionOptional: 'Description (optional)',
    descriptionPlaceholder: 'Describe your group\'s goal...',
    createGroupButton: 'Create Group',
    error: 'Error',
    groupCreated: 'Group created!',
    groupCreatedDesc: 'is ready to receive contributions.',
    noGroupsYet: 'You don\'t have any groups yet.',
    createOrJoin: 'Create a new group or join one with an invite code!',
    activeGroups: 'active groups',
    signOut: 'Sign Out',
    subscribePremium: 'Subscribe Premium',
    perMonth: '/month',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already have an account?',
    signUpNow: 'Sign up',
    signInNow: 'Sign in',
    welcomeBack: 'Welcome back',
    createAccount: 'Create account',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    enterName: 'Enter your name',
    selectCountry: 'Select your country',
    hello: 'Hello',
    youUser: '(you)',
    noMembersYet: 'No members yet. Invite your friends!',
    welcomeToGroup: 'Welcome to',
    startContributing: 'Start contributing and invite your friends!',
    quickContribution: 'Quick contribution',
    customAmount: 'Custom amount',
    enterAmount: 'Enter amount',
    confirmContribution: 'Confirm contribution',
    contributionSuccess: 'Contribution made!',
    addedToGroup: 'added to the group',
    streakDay: 'day streak',
    streakDays: 'days streak',
    phone: 'Phone',
    city: 'City',
    cityPlaceholder: 'Toronto',
    checkEmail: 'Check your email',
    confirmationSent: 'We sent you a confirmation link to verify your account.',
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
    continue: 'Continuer',
    installApp: 'Installer Billi',
    installDescription: 'Ajoutez l\'app à votre écran d\'accueil pour un accès rapide et hors ligne.',
    installNow: 'Installer Maintenant',
    installOnIOS: 'Installer sur iPhone',
    tapShare: 'Appuyez sur Partager',
    tapShareDesc: 'Dans la barre inférieure de Safari',
    addToHomeScreen: 'Ajouter à l\'écran d\'accueil',
    addToHomeScreenDesc: 'Faites défiler et appuyez sur l\'option',
    understood: 'Compris',
    // New translations
    groupPhoto: 'Photo du Groupe',
    addPhotoForGroup: 'Ajoutez une photo pour votre groupe',
    groupName: 'Nom du Groupe',
    groupNamePlaceholder: 'Ex: Voyage à Paris',
    goalAmount: 'Objectif',
    description: 'Description',
    descriptionOptional: 'Description (optionnel)',
    descriptionPlaceholder: 'Décrivez l\'objectif du groupe...',
    createGroupButton: 'Créer le Groupe',
    error: 'Erreur',
    groupCreated: 'Groupe créé!',
    groupCreatedDesc: 'est prêt à recevoir des contributions.',
    noGroupsYet: 'Vous n\'avez pas encore de groupes.',
    createOrJoin: 'Créez un nouveau groupe ou rejoignez-en un avec un code d\'invitation!',
    activeGroups: 'groupes actifs',
    signOut: 'Déconnexion',
    subscribePremium: 'Souscrire Premium',
    perMonth: '/mois',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    noAccount: 'Pas de compte?',
    hasAccount: 'Déjà un compte?',
    signUpNow: 'Inscrivez-vous',
    signInNow: 'Connectez-vous',
    welcomeBack: 'Bon retour',
    createAccount: 'Créer un compte',
    enterEmail: 'Entrez votre e-mail',
    enterPassword: 'Entrez votre mot de passe',
    enterName: 'Entrez votre nom',
    selectCountry: 'Sélectionnez votre pays',
    hello: 'Bonjour',
    youUser: '(vous)',
    noMembersYet: 'Pas encore de membres. Invitez vos amis!',
    welcomeToGroup: 'Bienvenue dans',
    startContributing: 'Commencez à contribuer et invitez vos amis!',
    quickContribution: 'Contribution rapide',
    customAmount: 'Montant personnalisé',
    enterAmount: 'Entrez le montant',
    confirmContribution: 'Confirmer la contribution',
    contributionSuccess: 'Contribution effectuée!',
    addedToGroup: 'ajoutés au groupe',
    streakDay: 'jour de série',
    streakDays: 'jours de série',
    phone: 'Téléphone',
    city: 'Ville',
    cityPlaceholder: 'Toronto',
    checkEmail: 'Vérifiez votre e-mail',
    confirmationSent: 'Nous vous avons envoyé un lien de confirmation pour vérifier votre compte.',
  },
};

// Base currency is CAD - all rates are relative to CAD
const currencyRates: Record<Currency, number> = {
  CAD: 1,
  USD: 0.74,
  EUR: 0.68,
  BRL: 3.70,
};

const currencySymbols: Record<Currency, string> = {
  CAD: '$',
  USD: 'US$',
  EUR: '€',
  BRL: 'R$',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to safely get from localStorage
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (stored as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => 
    getStoredValue<Language>(STORAGE_KEY_LANGUAGE, 'en')
  );
  const [currency, setCurrencyState] = useState<Currency>(() => 
    getStoredValue<Currency>(STORAGE_KEY_CURRENCY, 'CAD')
  );
  const [user, setUser] = useState<User | null>(null);

  // Persist language to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  };

  // Persist currency to localStorage
  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, curr);
    } catch (e) {
      console.error('Failed to save currency preference:', e);
    }
  };
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Japan Adventure 🇯🇵',
      description: 'Together to explore the Land of the Rising Sun',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      goal: 12000,
      current: 7800,
      members: [
        { id: '1', name: 'James Wilson', contribution: 2100, lastContribution: new Date(), rank: 1 },
        { id: '2', name: 'Sophie Martin', contribution: 1800, lastContribution: new Date(Date.now() - 86400000), rank: 2 },
        { id: '3', name: 'Michael Chen', contribution: 1650, lastContribution: new Date(Date.now() - 172800000), rank: 3 },
        { id: '4', name: 'Emma Thompson', contribution: 1350, lastContribution: new Date(Date.now() - 604800000 * 2), rank: 4 },
        { id: '5', name: 'Daniel Roy', contribution: 900, lastContribution: new Date(Date.now() - 604800000 * 3), rank: 5 },
      ],
      messages: [
        { id: '1', userId: 'bot', userName: 'Bili Bot', content: 'Billionaire James just contributed $150!', timestamp: new Date(), isBot: true },
        { id: '2', userId: '2', userName: 'Sophie Martin', content: "We're gonna make it! 🚀", timestamp: new Date(Date.now() - 3600000) },
      ],
      inviteCode: 'JAPAN1',
    },
    {
      id: '2',
      name: 'Tesla Dream 🚗',
      description: 'Our sustainable electric vehicle fund',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      goal: 45000,
      current: 13500,
      members: [
        { id: '1', name: 'Alex Tremblay', contribution: 4500, lastContribution: new Date(), rank: 1 },
        { id: '2', name: 'Jessica Lee', contribution: 3600, lastContribution: new Date(Date.now() - 86400000), rank: 2 },
        { id: '3', name: 'Ryan Côté', contribution: 3000, lastContribution: new Date(Date.now() - 604800000 * 2), rank: 3 },
        { id: '4', name: 'Amanda Singh', contribution: 2400, lastContribution: new Date(Date.now() - 604800000 * 3), rank: 4 },
      ],
      messages: [],
      inviteCode: 'TESLAEV',
    },
  ]);

  const [communities] = useState<Community[]>([
    {
      id: '1',
      name: 'Japan Adventure',
      description: 'Make your dream trip to Japan a reality',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      members: 1247,
      category: 'Travel',
    },
    {
      id: '2',
      name: 'Tesla Dream',
      description: 'Sustainable electric mobility',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      members: 892,
      category: 'Vehicle',
    },
    {
      id: '3',
      name: 'Downtown Condo',
      description: 'Your apartment in the heart of the city',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      members: 2134,
      category: 'Real Estate',
    },
    {
      id: '4',
      name: 'MBA Toronto',
      description: 'Elite education for your career',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      members: 567,
      category: 'Education',
    },
  ]);

  const convertCurrency = (value: number): number => {
    return value * currencyRates[currency];
  };

  const formatCurrency = (value: number): string => {
    const converted = convertCurrency(value);
    const locale = language === 'pt' ? 'pt-BR' : language === 'fr' ? 'fr-CA' : 'en-CA';
    return `${currencySymbols[currency]} ${converted.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
