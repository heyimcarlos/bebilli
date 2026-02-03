import React from 'react';
import { Flame, Trophy, Crown, Settings, Globe, DollarSign, LogOut } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import billiLogo from '@/assets/billi-logo.png';
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
  const { profile, user } = useAuthContext();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary p-3 mb-4 glow-primary">
            <img src={billiLogo} alt="Billi" className="w-full h-full object-contain" />
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
            <Select value={language} onValueChange={(v) => setLanguage(v as 'pt' | 'en' | 'fr')}>
              <SelectTrigger className="w-32 bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">🇧🇷 Português</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-px bg-border" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <Label>{t('currency')}</Label>
            </div>
            <Select value={currency} onValueChange={(v) => setCurrency(v as 'BRL' | 'USD' | 'EUR' | 'CAD')}>
              <SelectTrigger className="w-32 bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">R$ BRL</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="CAD">C$ CAD</SelectItem>
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
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
