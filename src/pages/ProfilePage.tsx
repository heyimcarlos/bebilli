import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Crown, Settings, Globe, DollarSign, LogOut, Camera, Loader2, Share2, Moon, Sun, Palette, Shield, UserPlus, UserCheck, Users, Clock, AtSign, Check, X, Zap, Target } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useGroups } from '@/hooks/useGroups';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import BilliLogo from '@/components/BilliLogo';
import DefaultAvatar from '@/components/DefaultAvatar';
import ShareProgressCard from '@/components/ShareProgressCard';
import InviteToBilli from '@/components/InviteToBilli';
import ProfileBadges from '@/components/ProfileBadges';
import PremiumAnalytics from '@/components/PremiumAnalytics';
import PremiumModal from '@/components/PremiumModal';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProfilePageProps {
  onLogout: () => void;
}

const AVATAR_NAMES = [
  'Alex', 'Jordan', 'Morgan', 'Taylor', 'Casey',
  'Riley', 'Quinn', 'Avery', 'Dakota', 'Skyler',
  'Jamie', 'Robin', 'Charlie', 'Drew', 'Sage',
  'Kai', 'Remy', 'Finley', 'Parker', 'Reese',
];

const LEVEL_TITLES: Record<number, Record<string, string>> = {
  1: { en: 'Starter', pt: 'Iniciante', fr: 'Débutant', es: 'Principiante', it: 'Principiante', de: 'Anfänger' },
  2: { en: 'Saver', pt: 'Poupador', fr: 'Épargnant', es: 'Ahorrador', it: 'Risparmiatore', de: 'Sparer' },
  3: { en: 'Builder', pt: 'Construtor', fr: 'Bâtisseur', es: 'Constructor', it: 'Costruttore', de: 'Baumeister' },
  4: { en: 'Investor', pt: 'Investidor', fr: 'Investisseur', es: 'Inversor', it: 'Investitore', de: 'Investor' },
  5: { en: 'Architect', pt: 'Arquiteto', fr: 'Architecte', es: 'Arquitecto', it: 'Architetto', de: 'Architekt' },
  6: { en: 'Mogul', pt: 'Magnata', fr: 'Magnat', es: 'Magnate', it: 'Magnate', de: 'Mogul' },
  7: { en: 'Tycoon', pt: 'Tycoon', fr: 'Tycoon', es: 'Magnate', it: 'Tycoon', de: 'Tycoon' },
  8: { en: 'Legend', pt: 'Lenda', fr: 'Légende', es: 'Leyenda', it: 'Leggenda', de: 'Legende' },
};

const getLevelTitle = (level: number, lang: string) => {
  const capped = Math.min(level, 8);
  return LEVEL_TITLES[capped]?.[lang] || LEVEL_TITLES[capped]?.en || 'Billionaire';
};

interface FollowUser {
  id: string;
  follower_id: string;
  following_id: string;
  status: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  level?: number;
  consistency_days?: number;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { t, language, setLanguage, currency, setCurrency, formatCurrency } = useApp();
  const { profile, user, updateProfile } = useAuthContext();
  const { groups } = useGroups(user?.id);
  const { uploadAvatar, uploading } = useImageUpload();
  const { toast } = useToast();
  const { isPremium } = usePremiumCheck(user?.id);
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [showFollowsTab, setShowFollowsTab] = useState<'followers' | 'following' | 'requests' | null>(null);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FollowUser[]>([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0, pending: 0 });
  const [consistencyRank, setConsistencyRank] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  // Load follow data
  useEffect(() => {
    if (!user) return;
    const loadFollowData = async () => {
      // Followers (people following me)
      const { data: followersData } = await supabase
        .from('user_follows' as any)
        .select('*')
        .eq('following_id', user.id)
        .eq('status', 'accepted');
      
      // Following (people I follow)
      const { data: followingData } = await supabase
        .from('user_follows' as any)
        .select('*')
        .eq('follower_id', user.id)
        .eq('status', 'accepted');
      
      // Pending requests (people wanting to follow me)
      const { data: pendingData } = await supabase
        .from('user_follows' as any)
        .select('*')
        .eq('following_id', user.id)
        .eq('status', 'pending');

      setFollowCounts({
        followers: (followersData as any[])?.length || 0,
        following: (followingData as any[])?.length || 0,
        pending: (pendingData as any[])?.length || 0,
      });

      // Enrich with profile data
      const enrichFollows = async (data: any[], idField: string) => {
        if (!data?.length) return [];
        const ids = data.map(d => d[idField]);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, level, consistency_days')
          .in('id', ids);
        
        const profileMap = new Map((profiles as any[])?.map(p => [p.id, p]) || []);
        return data.map(d => ({
          ...d,
          ...(profileMap.get(d[idField]) || {}),
        }));
      };

      setFollowers(await enrichFollows(followersData as any[] || [], 'follower_id'));
      setFollowing(await enrichFollows(followingData as any[] || [], 'following_id'));
      setPendingRequests(await enrichFollows(pendingData as any[] || [], 'follower_id'));
    };
    loadFollowData();
  }, [user]);

  // Load consistency ranking
  useEffect(() => {
    if (!user || !profile) return;
    const loadRank = async () => {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('consistency_days', 0);
      
      const { count: usersAbove } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('consistency_days', profile.consistency_days || 0);
      
      if (totalUsers && totalUsers > 0) {
        const rank = Math.max(1, Math.round(((usersAbove || 0) / totalUsers) * 100));
        setConsistencyRank(100 - rank);
      }
    };
    loadRank();
  }, [user, profile]);

  const shareStats = {
    totalSaved: profile?.max_saved || 0,
    level: profile?.level || 1,
    streak: profile?.current_streak || 0,
    groupsCount: groups.length,
    contributionsCount: profile?.total_contributions || 0,
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const avatarUrl = await uploadAvatar(file, user.id);
    if (avatarUrl) {
      const { error } = await updateProfile({ avatar_url: avatarUrl });
      if (error) {
        toast({ title: 'Error', description: 'Failed to update avatar', variant: 'destructive' });
      } else {
        toast({ title: '✨', description: t('avatarUpdated') || 'Avatar updated!' });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveUsername = async () => {
    if (!user || !usernameInput.trim()) return;
    const clean = usernameInput.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (clean.length < 3) {
      toast({ title: t('error'), description: 'Username must be at least 3 characters', variant: 'destructive' });
      return;
    }
    setUsernameLoading(true);
    const { error } = await updateProfile({ username: clean } as any);
    setUsernameLoading(false);
    if (error) {
      toast({ title: t('error'), description: error.message?.includes('unique') ? 'Username already taken' : error.message, variant: 'destructive' });
    } else {
      toast({ title: '✨', description: `@${clean} is yours!` });
      setEditingUsername(false);
    }
  };

  const handleFollowAction = async (followId: string, action: 'accepted' | 'rejected') => {
    await supabase.from('user_follows' as any).update({ status: action }).eq('id', followId);
    setPendingRequests(prev => prev.filter(p => p.id !== followId));
    if (action === 'accepted') {
      setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1, pending: prev.pending - 1 }));
    } else {
      setFollowCounts(prev => ({ ...prev, pending: prev.pending - 1 }));
    }
  };

  // Emotional progress phrases
  const getEmotionalProgress = () => {
    const groupsWithProgress = groups.map(g => ({
      name: g.name,
      progress: g.goal_amount > 0 ? Math.round((g.current_amount / g.goal_amount) * 100) : 0,
    })).filter(g => g.progress > 0 && g.progress < 100);

    if (groupsWithProgress.length === 0) return null;
    const top = groupsWithProgress.sort((a, b) => b.progress - a.progress)[0];
    
    const phrases: Record<string, string[]> = {
      pt: [
        `Você está ${top.progress}% mais perto de conquistar "${top.name}" 🚀`,
        `Faltam apenas ${100 - top.progress}% para realizar "${top.name}" ✨`,
      ],
      en: [
        `You're ${top.progress}% closer to achieving "${top.name}" 🚀`,
        `Only ${100 - top.progress}% left to reach "${top.name}" ✨`,
      ],
      fr: [
        `Vous êtes à ${top.progress}% de réaliser "${top.name}" 🚀`,
        `Plus que ${100 - top.progress}% pour atteindre "${top.name}" ✨`,
      ],
      es: [
        `Estás ${top.progress}% más cerca de lograr "${top.name}" 🚀`,
        `Solo falta ${100 - top.progress}% para alcanzar "${top.name}" ✨`,
      ],
      it: [
        `Sei al ${top.progress}% di raggiungere "${top.name}" 🚀`,
        `Manca solo il ${100 - top.progress}% per completare "${top.name}" ✨`,
      ],
      de: [
        `Du bist ${top.progress}% näher an "${top.name}" 🚀`,
        `Nur noch ${100 - top.progress}% bis "${top.name}" ✨`,
      ],
    };

    const langPhrases = phrases[language] || phrases.en;
    return langPhrases[Math.floor(Math.random() * langPhrases.length)];
  };

  const emotionalPhrase = getEmotionalProgress();
  const levelTitle = getLevelTitle(profile?.level || 1, language);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header - Game Style */}
      <div className="relative px-6 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
        
        <div className="relative z-10 text-center">
          {/* Avatar */}
          <div className="relative w-24 h-24 mx-auto mb-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <motion.div 
              className="w-24 h-24 rounded-full bg-primary overflow-hidden ring-4 ring-primary/30"
              whileHover={{ scale: 1.05 }}
            >
              {profile?.avatar_url?.startsWith('avatar:') ? (
                <DefaultAvatar name={profile.avatar_url.replace('avatar:', '')} size={96} />
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <DefaultAvatar name={profile?.name || 'User'} size={96} />
              )}
            </motion.div>
            {/* Level badge */}
            <motion.div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black tracking-wider shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              LVL {profile?.level || 1}
            </motion.div>
            <div className="absolute -top-1 -right-1 flex gap-1">
              <button onClick={() => setShowAvatarPicker(true)} className="w-7 h-7 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-accent-foreground" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center disabled:opacity-50">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl font-black mb-0.5">{profile?.name || 'Billionaire'}</h1>
          
          {/* Username */}
          {editingUsername ? (
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="relative">
                <AtSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  className="h-8 pl-7 pr-2 text-sm w-40 bg-secondary"
                  placeholder="username"
                  maxLength={20}
                />
              </div>
              <Button size="sm" onClick={handleSaveUsername} disabled={usernameLoading} className="h-8 px-3">
                {usernameLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)} className="h-8 px-2">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <button onClick={() => { setUsernameInput((profile as any)?.username || ''); setEditingUsername(true); }} className="text-sm text-primary font-medium hover:underline">
              {(profile as any)?.username ? `@${(profile as any).username}` : `+ ${t('addUsername') || 'Add username'}`}
            </button>
          )}

          {/* Level title */}
          <motion.div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">{levelTitle}</span>
          </motion.div>

          {profile?.is_premium ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium ml-2">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          ) : (
            <Button variant="outline" size="sm" className="mt-2 ml-2 border-accent text-accent hover:bg-accent/10" onClick={() => setShowPremiumModal(true)}>
              <Crown className="w-3.5 h-3.5 mr-1" />
              {t('goPremium') || 'Go Premium'}
            </Button>
          )}

          {/* Follows Stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <button onClick={() => setShowFollowsTab('followers')} className="text-center">
              <p className="text-lg font-black">{followCounts.followers}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('followers') || 'Followers'}</p>
            </button>
            <div className="w-px h-8 bg-border" />
            <button onClick={() => setShowFollowsTab('following')} className="text-center">
              <p className="text-lg font-black">{followCounts.following}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('following') || 'Following'}</p>
            </button>
            {followCounts.pending > 0 && (
              <>
                <div className="w-px h-8 bg-border" />
                <button onClick={() => setShowFollowsTab('requests')} className="text-center relative">
                  <p className="text-lg font-black text-primary">{followCounts.pending}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('requests') || 'Requests'}</p>
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Emotional Progress Banner */}
      {emotionalPhrase && (
        <motion.div 
          className="mx-6 mb-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm font-medium">{emotionalPhrase}</p>
          </div>
        </motion.div>
      )}

      {/* Consistency Rank */}
      {consistencyRank !== null && consistencyRank > 0 && (
        <motion.div 
          className="mx-6 mb-4 p-4 rounded-2xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Top {consistencyRank}% {t('mostConsistent') || 'most consistent this month'}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.consistency_days || 0} {t('consistencyDays')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Stats Grid */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <motion.div className="glass-card p-3 text-center" whileHover={{ scale: 1.02 }}>
            <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black gradient-text">{profile?.current_streak || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('streak')}</p>
          </motion.div>
          <motion.div className="glass-card p-3 text-center" whileHover={{ scale: 1.02 }}>
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-black gradient-gold-text">{profile?.best_streak || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('bestStreak')}</p>
          </motion.div>
          <motion.div className="glass-card p-3 text-center" whileHover={{ scale: 1.02 }}>
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black">{profile?.total_contributions || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('deposits')}</p>
          </motion.div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="px-6 mb-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('progressToLevel') || 'Progress to Level'} {(profile?.level || 1) + 1}
            </span>
            <span className="text-xs font-bold text-primary">{levelTitle} → {getLevelTitle((profile?.level || 1) + 1, language)}</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((profile?.total_contributions || 0) % 20) / 20 * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Share & Actions */}
      <div className="px-6 mb-4 flex gap-2">
        <Button onClick={() => setShowShareCard(true)} className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl">
          <Share2 className="w-4 h-4 mr-2" />
          {t('shareProgress')}
        </Button>
      </div>

      <div className="px-6 mb-4">
        <InviteToBilli />
      </div>

      <div className="px-6 mb-4">
        <ProfileBadges
          streak={profile?.current_streak || 0}
          totalContributions={profile?.total_contributions || 0}
          totalAmount={profile?.max_saved || 0}
          groupsCount={groups.length}
          level={profile?.level || 1}
          isPremium={isPremium}
        />
      </div>

      {isPremium && (
        <div className="px-6 mb-4">
          <PremiumAnalytics />
        </div>
      )}

      {/* Settings */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">{t('settings')}</h2>
        </div>
        
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label>{t('language')}</Label>
            </div>
            <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
              <SelectTrigger className="w-36 bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇨🇦 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="pt">🇧🇷 Português</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-px bg-border" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <Label>{t('currency')}</Label>
            </div>
            <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
              <SelectTrigger className="w-36 bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="CAD">CA$ CAD</SelectItem>
                <SelectItem value="USD">US$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
                <SelectItem value="BRL">R$ BRL</SelectItem>
                <SelectItem value="MXN">MX$ MXN</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
                <SelectItem value="AUD">A$ AUD</SelectItem>
                <SelectItem value="JPY">¥ JPY</SelectItem>
                <SelectItem value="CNY">¥ CNY</SelectItem>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="KRW">₩ KRW</SelectItem>
                <SelectItem value="SGD">S$ SGD</SelectItem>
                <SelectItem value="NZD">NZ$ NZD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-border" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <Label>{t('theme')}</Label>
            </div>
            <Select value={theme || 'light'} onValueChange={setTheme}>
              <SelectTrigger className="w-36 bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">☀️ {t('lightMode')}</SelectItem>
                <SelectItem value="dark">🌙 {t('darkMode')}</SelectItem>
                <SelectItem value="system">💻 {t('systemMode')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={() => navigate('/admin')} variant="outline" className="w-full mt-3 h-11 border-primary text-primary hover:bg-primary/10 rounded-xl font-bold">
            <Shield className="w-5 h-5 mr-2" />
            {t('adminPanel') || 'Admin Panel'}
          </Button>
        )}

        <Button onClick={onLogout} variant="outline" className="w-full mt-3 h-11 border-destructive text-destructive hover:bg-destructive/10 rounded-xl font-bold">
          <LogOut className="w-5 h-5 mr-2" />
          {t('signOut')}
        </Button>
      </div>

      {/* Share Progress Modal */}
      <ShareProgressCard isOpen={showShareCard} onClose={() => setShowShareCard(false)} stats={shareStats} />

      {/* Premium Modal */}
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} reason="feature" />

      {/* Avatar Picker */}
      <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('chooseAvatar') || 'Choose your avatar'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {AVATAR_NAMES.map((avatarName) => (
              <button
                key={avatarName}
                onClick={async () => {
                  if (!user) return;
                  const { error } = await updateProfile({ avatar_url: `avatar:${avatarName}` });
                  if (!error) {
                    toast({ title: '✨', description: t('avatarUpdated') || 'Avatar updated!' });
                    setShowAvatarPicker(false);
                  }
                }}
                className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
              >
                <DefaultAvatar name={avatarName} size={64} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Follows Dialog */}
      <Dialog open={showFollowsTab !== null} onOpenChange={(open) => !open && setShowFollowsTab(null)}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showFollowsTab === 'followers' && (t('followers') || 'Followers')}
              {showFollowsTab === 'following' && (t('following') || 'Following')}
              {showFollowsTab === 'requests' && (t('followRequests') || 'Follow Requests')}
            </DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-4">
            {(['followers', 'following', 'requests'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setShowFollowsTab(tab)}
                className={`flex-1 text-xs py-2 rounded-md font-semibold transition-colors ${
                  showFollowsTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {tab === 'followers' ? t('followers') || 'Followers' :
                 tab === 'following' ? t('following') || 'Following' :
                 `${t('requests') || 'Requests'} ${followCounts.pending > 0 ? `(${followCounts.pending})` : ''}`}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {showFollowsTab === 'requests' && pendingRequests.map(req => (
              <motion.div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                  {req.avatar_url ? (
                    <img src={req.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <DefaultAvatar name={req.name || 'User'} size={40} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.name}</p>
                  {req.username && <p className="text-xs text-muted-foreground">@{req.username}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="h-8 px-3 rounded-lg" onClick={() => handleFollowAction(req.id, 'accepted')}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg" onClick={() => handleFollowAction(req.id, 'rejected')}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {showFollowsTab === 'followers' && followers.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                  {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" /> : <DefaultAvatar name={f.name || 'User'} size={40} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  {f.username && <p className="text-xs text-muted-foreground">@{f.username}</p>}
                  <p className="text-[10px] text-muted-foreground">LVL {f.level || 1} · {f.consistency_days || 0} {t('consistencyDays')}</p>
                </div>
              </div>
            ))}

            {showFollowsTab === 'following' && following.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                  {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" /> : <DefaultAvatar name={f.name || 'User'} size={40} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  {f.username && <p className="text-xs text-muted-foreground">@{f.username}</p>}
                  <p className="text-[10px] text-muted-foreground">LVL {f.level || 1} · {f.consistency_days || 0} {t('consistencyDays')}</p>
                </div>
              </div>
            ))}

            {((showFollowsTab === 'followers' && followers.length === 0) ||
              (showFollowsTab === 'following' && following.length === 0) ||
              (showFollowsTab === 'requests' && pendingRequests.length === 0)) && (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {showFollowsTab === 'requests' ? (t('noPendingRequests') || 'No pending requests') : (t('noUsersYet') || 'No users yet')}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
