import React, { useRef, useState } from 'react';
import { Flame, Trophy, Crown, Settings, Globe, DollarSign, LogOut, Camera, Loader2, Share2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import billiLogo from '@/assets/billi-logo.png';
import ShareProgressCard from '@/components/ShareProgressCard';
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

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { t, language, setLanguage, currency, setCurrency, formatCurrency } = useApp();
  const { profile, user, updateProfile } = useAuthContext();
  const { groups } = useGroups(user?.id);
  const { uploadAvatar, uploading } = useImageUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  // Calculate stats for sharing
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
        toast({
          title: 'Error',
          description: 'Failed to update avatar',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✨ Avatar updated!',
          description: 'Your profile photo has been changed.',
        });
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        
        <div className="relative z-10 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="w-24 h-24 rounded-full bg-primary overflow-hidden glow-primary">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-3">
                  <img src={billiLogo} alt="Billi" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <h1 className="text-2xl font-bold mb-1">{profile?.name || 'Billionaire'}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          
          {profile?.is_premium ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium mt-2">
              <Crown className="w-3 h-3" />
              Billi Premium
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-accent text-accent hover:bg-accent/10"
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscribe Premium - {formatCurrency(5.90)}/month
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold gradient-text">{profile?.consistency_days || 0}</p>
            <p className="text-xs text-muted-foreground">{t('consistencyDays')}</p>
          </div>
          
          <div className="glass-card p-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-bold gradient-gold-text">{formatCurrency(profile?.max_saved || 0)}</p>
            <p className="text-xs text-muted-foreground">{t('maxSaved')}</p>
          </div>
        </div>

        {/* Share Progress Button */}
        <Button
          onClick={() => setShowShareCard(true)}
          className="w-full mt-4 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <Share2 className="w-5 h-5 mr-2" />
          {t('shareProgress')}
        </Button>
      </div>

      {/* Settings */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t('settings')}</h2>
        </div>
        
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label>{t('language')}</Label>
            </div>
            <Select value={language} onValueChange={(v) => setLanguage(v as 'pt' | 'en' | 'fr' | 'es' | 'it' | 'de')}>
              <SelectTrigger className="w-36 bg-secondary">
                <SelectValue />
              </SelectTrigger>
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
            <Select value={currency} onValueChange={(v) => setCurrency(v as 'BRL' | 'USD' | 'EUR' | 'CAD' | 'MXN' | 'CHF' | 'GBP')}>
              <SelectTrigger className="w-36 bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAD">$ CAD</SelectItem>
                <SelectItem value="USD">US$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
                <SelectItem value="BRL">R$ BRL</SelectItem>
                <SelectItem value="MXN">MX$ MXN</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full mt-6 h-12 border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('signOut')}
        </Button>
      </div>

      {/* Share Progress Modal */}
      <ShareProgressCard
        isOpen={showShareCard}
        onClose={() => setShowShareCard(false)}
        stats={shareStats}
      />
    </div>
  );
};

export default ProfilePage;
