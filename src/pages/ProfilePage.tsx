import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Crown, Settings, Globe, DollarSign, LogOut, Camera, Loader2, Share2, Moon, Sun, Palette, Shield, Users, AtSign, Check, X, Zap, HelpCircle, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useGroups } from '@/hooks/useGroups';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import DefaultAvatar from '@/components/DefaultAvatar';
import ShareProgressCard from '@/components/ShareProgressCard';
import InviteToBilli from '@/components/InviteToBilli';
import ProfileBadges from '@/components/ProfileBadges';
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
  const { t, language, setLanguage, currency, setCurrency } = useApp();
  const { profile, user, updateProfile } = useAuthContext();
  const { groups } = useGroups(user?.id);
  const { uploadAvatar, uploading } = useImageUpload();
  const { toast } = useToast();
  const { isPremium } = usePremiumCheck(user?.id);
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const usernameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time username availability check
  useEffect(() => {
    const clean = usernameInput.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (clean.length < 3 || clean === (profile as any)?.username) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
    usernameCheckTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', clean)
        .neq('id', user?.id || '')
        .limit(1);
      setUsernameAvailable(!data || data.length === 0);
      setUsernameChecking(false);
    }, 400);
    return () => { if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current); };
  }, [usernameInput, user?.id, profile]);
  const [showFollowsTab, setShowFollowsTab] = useState<'followers' | 'following' | 'requests' | null>(null);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FollowUser[]>([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0, pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const loadFollowData = async () => {
      const { data: followersData } = await supabase.from('user_follows' as any).select('*').eq('following_id', user.id).eq('status', 'accepted');
      const { data: followingData } = await supabase.from('user_follows' as any).select('*').eq('follower_id', user.id).eq('status', 'accepted');
      const { data: pendingData } = await supabase.from('user_follows' as any).select('*').eq('following_id', user.id).eq('status', 'pending');

      setFollowCounts({
        followers: (followersData as any[])?.length || 0,
        following: (followingData as any[])?.length || 0,
        pending: (pendingData as any[])?.length || 0,
      });

      const enrichFollows = async (data: any[], idField: string) => {
        if (!data?.length) return [];
        const ids = data.map(d => d[idField]);
        const { data: profiles } = await supabase.from('profiles').select('id, name, username, avatar_url, level, consistency_days').in('id', ids);
        const profileMap = new Map((profiles as any[])?.map(p => [p.id, p]) || []);
        return data.map(d => ({ ...d, ...(profileMap.get(d[idField]) || {}) }));
      };

      setFollowers(await enrichFollows(followersData as any[] || [], 'follower_id'));
      setFollowing(await enrichFollows(followingData as any[] || [], 'following_id'));
      setPendingRequests(await enrichFollows(pendingData as any[] || [], 'follower_id'));
    };
    loadFollowData();
  }, [user]);

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
      if (!error) toast({ title: '✨', description: t('avatarUpdated') || 'Avatar updated!' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveUsername = async () => {
    if (!user || !usernameInput.trim()) return;
    const clean = usernameInput.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (clean.length < 3) { toast({ title: t('error'), description: 'Min 3 characters', variant: 'destructive' }); return; }
    if (usernameAvailable === false) { toast({ title: t('error'), description: t('usernameTaken') || 'Username already taken', variant: 'destructive' }); return; }
    setUsernameLoading(true);
    const { error } = await updateProfile({ username: clean } as any);
    setUsernameLoading(false);
    if (error) {
      toast({ title: t('error'), description: error.message?.includes('unique') ? (t('usernameTaken') || 'Username already taken') : error.message, variant: 'destructive' });
    } else {
      toast({ title: '✨', description: `@${clean} ${t('isYours') || 'is yours'}!` });
      setEditingUsername(false);
      setUsernameAvailable(null);
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

  const levelTitle = getLevelTitle(profile?.level || 1, language);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative px-6 pt-12 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="relative z-10 text-center">
          {/* Avatar */}
          <div className="relative w-20 h-20 mx-auto mb-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <motion.div className="w-20 h-20 rounded-full bg-primary overflow-hidden ring-3 ring-primary/30" whileHover={{ scale: 1.05 }}>
              {profile?.avatar_url?.startsWith('avatar:') ? (
                <DefaultAvatar name={profile.avatar_url.replace('avatar:', '')} size={80} />
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <DefaultAvatar name={profile?.name || 'User'} size={80} />
              )}
            </motion.div>
            <motion.div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black tracking-wider shadow-lg" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              LVL {profile?.level || 1}
            </motion.div>
            <div className="absolute -top-1 -right-1 flex gap-1">
              <button onClick={() => setShowAvatarPicker(true)} className="w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                <Palette className="w-3 h-3 text-accent-foreground" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center disabled:opacity-50">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <h1 className="text-xl font-black">{profile?.name || 'Billionaire'}</h1>

          {/* Username */}
          {editingUsername ? (
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <AtSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={usernameInput} onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))} className={`h-7 pl-7 pr-2 text-xs w-36 bg-secondary ${usernameAvailable === false ? 'border-destructive' : usernameAvailable === true ? 'border-green-500' : ''}`} placeholder="username" maxLength={20} />
                </div>
                <Button size="sm" onClick={handleSaveUsername} disabled={usernameLoading || usernameAvailable === false || usernameChecking} className="h-7 px-2">
                  {usernameLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingUsername(false); setUsernameAvailable(null); }} className="h-7 px-2">
                  <X className="w-3 h-3" />
                </Button>
              </div>
              {usernameInput.trim().length >= 3 && (
                <span className={`text-[10px] font-medium ${usernameChecking ? 'text-muted-foreground' : usernameAvailable === true ? 'text-green-500' : usernameAvailable === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {usernameChecking ? (t('checking') || 'Checking...') : usernameAvailable === true ? (t('usernameAvailable') || '✓ Available') : usernameAvailable === false ? (t('usernameTaken') || '✗ Already taken') : ''}
                </span>
              )}
            </div>
          ) : (
            <button onClick={() => { setUsernameInput((profile as any)?.username || ''); setEditingUsername(true); }} className="text-xs text-primary font-medium hover:underline">
              {(profile as any)?.username ? `@${(profile as any).username}` : `+ ${t('addUsername') || 'Add username'}`}
            </button>
          )}

          {/* Level + Premium badge */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary">
              <Zap className="w-3 h-3" /> {levelTitle}
            </span>
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-[11px] font-medium">
                <Crown className="w-3 h-3" /> VIP
              </span>
            )}
          </div>

          {/* Follow stats */}
          <div className="flex items-center justify-center gap-6 mt-3">
            <button onClick={() => setShowFollowsTab('followers')} className="text-center">
              <p className="text-lg font-black">{followCounts.followers}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('followers') || 'Followers'}</p>
            </button>
            <div className="w-px h-6 bg-border" />
            <button onClick={() => setShowFollowsTab('following')} className="text-center">
              <p className="text-lg font-black">{followCounts.following}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('following') || 'Following'}</p>
            </button>
            {followCounts.pending > 0 && (
              <>
                <div className="w-px h-6 bg-border" />
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

      {/* Stats Grid */}
      <div className="px-6 mb-3">
        <div className="grid grid-cols-3 gap-2">
          <motion.div className="glass-card p-3 text-center" whileHover={{ scale: 1.02 }}>
            <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black gradient-text">{profile?.current_streak || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('streak')}</p>
          </motion.div>
          <motion.div className="glass-card p-3 text-center" whileHover={{ scale: 1.02 }}>
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-black">{profile?.best_streak || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('bestStreak')}</p>
          </motion.div>
          <motion.div className="glass-card p-3 text-center" whileHover={{ scale: 1.02 }}>
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black">{profile?.total_contributions || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('deposits')}</p>
          </motion.div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mb-3 flex gap-2">
        <Button onClick={() => setShowShareCard(true)} className="flex-1 h-10 bg-primary text-primary-foreground font-bold rounded-xl text-sm">
          <Share2 className="w-4 h-4 mr-1" />
          {t('shareProgress')}
        </Button>
      </div>

      <div className="px-6 mb-3">
        <InviteToBilli />
      </div>

      <div className="px-6 mb-3">
        <ProfileBadges streak={profile?.current_streak || 0} totalContributions={profile?.total_contributions || 0} totalAmount={profile?.max_saved || 0} groupsCount={groups.length} level={profile?.level || 1} isPremium={isPremium} />
      </div>

      {/* Settings */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings')}</h2>
        </div>
        
        <div className="glass-card p-3 space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>{t('language')}</span>
            </div>
            <Select value={language} onValueChange={async (val) => {
              setLanguage(val as any);
              if (user) await updateProfile({ language: val } as any);
            }}>
              <SelectTrigger className="w-36 h-8 bg-secondary text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">🇧🇷 Português</SelectItem>
                <SelectItem value="en">🇨🇦 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>{t('currency')}</span>
            </div>
            <Select value={currency} onValueChange={async (val) => {
              setCurrency(val as any);
              if (user) await updateProfile({ currency: val } as any);
            }}>
              <SelectTrigger className="w-36 h-8 bg-secondary text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                <SelectItem value="BRL">🇧🇷 BRL</SelectItem>
                <SelectItem value="MXN">🇲🇽 MXN</SelectItem>
                <SelectItem value="AUD">🇦🇺 AUD</SelectItem>
                <SelectItem value="CHF">🇨🇭 CHF</SelectItem>
                <SelectItem value="JPY">🇯🇵 JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
              <span>{t('theme')}</span>
            </div>
            <Select value={theme || 'light'} onValueChange={setTheme}>
              <SelectTrigger className="w-32 h-8 bg-secondary text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">☀️ {t('lightMode')}</SelectItem>
                <SelectItem value="dark">🌙 {t('darkMode')}</SelectItem>
                <SelectItem value="system">💻 {t('systemMode')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Help & Feedback */}
        <div className="flex items-center gap-2 mb-2 mt-4">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('needHelp') || 'Help'}</h2>
        </div>
        <div className="glass-card p-3 space-y-2.5 text-sm">
          <a href="mailto:contact@bebilli.com" className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{t('needHelp') || 'Need help?'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <span>contact@bebilli.com</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>
          <div className="h-px bg-border" />
          <a href="mailto:contact@bebilli.com?subject=Feedback%20Billi" className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span>{t('feedback') || 'Send Feedback'}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        </div>

        {isAdmin && (
          <Button onClick={() => navigate('/admin')} variant="outline" className="w-full mt-3 h-10 border-primary text-primary hover:bg-primary/10 rounded-xl font-bold text-sm">
            <Shield className="w-4 h-4 mr-2" />
            {t('adminPanel') || 'Admin Panel'}
          </Button>
        )}
        <Button onClick={onLogout} variant="outline" className="w-full mt-2 h-10 border-destructive text-destructive hover:bg-destructive/10 rounded-xl font-bold text-sm">
          <LogOut className="w-4 h-4 mr-2" />
          {t('signOut')}
        </Button>
      </div>

      {/* Modals */}
      <ShareProgressCard isOpen={showShareCard} onClose={() => setShowShareCard(false)} stats={shareStats} />

      <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('chooseAvatar') || 'Choose your avatar'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {AVATAR_NAMES.map((avatarName) => (
              <button key={avatarName} onClick={async () => {
                if (!user) return;
                const { error } = await updateProfile({ avatar_url: `avatar:${avatarName}` });
                if (!error) { toast({ title: '✨', description: t('avatarUpdated') || 'Avatar updated!' }); setShowAvatarPicker(false); }
              }} className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
                <DefaultAvatar name={avatarName} size={56} />
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
          <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-3">
            {(['followers', 'following', 'requests'] as const).map(tab => (
              <button key={tab} onClick={() => setShowFollowsTab(tab)}
                className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${showFollowsTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {tab === 'followers' ? t('followers') || 'Followers' : tab === 'following' ? t('following') || 'Following' : `${t('requests') || 'Requests'} ${followCounts.pending > 0 ? `(${followCounts.pending})` : ''}`}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {showFollowsTab === 'requests' && pendingRequests.map(req => (
              <motion.div key={req.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                  {req.avatar_url ? <img src={req.avatar_url} className="w-full h-full object-cover" /> : <DefaultAvatar name={req.name || 'User'} size={36} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.name}</p>
                  {req.username && <p className="text-xs text-muted-foreground">@{req.username}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 px-2" onClick={() => handleFollowAction(req.id, 'accepted')}><Check className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => handleFollowAction(req.id, 'rejected')}><X className="w-3 h-3" /></Button>
                </div>
              </motion.div>
            ))}
            {showFollowsTab === 'followers' && followers.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                  {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" /> : <DefaultAvatar name={f.name || 'User'} size={36} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  {f.username && <p className="text-xs text-muted-foreground">@{f.username}</p>}
                </div>
              </div>
            ))}
            {showFollowsTab === 'following' && following.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                  {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" /> : <DefaultAvatar name={f.name || 'User'} size={36} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  {f.username && <p className="text-xs text-muted-foreground">@{f.username}</p>}
                </div>
              </div>
            ))}
            {((showFollowsTab === 'followers' && followers.length === 0) ||
              (showFollowsTab === 'following' && following.length === 0) ||
              (showFollowsTab === 'requests' && pendingRequests.length === 0)) && (
              <div className="text-center py-6">
                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
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
