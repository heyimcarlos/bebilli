import React, { useState } from 'react';
import { ArrowRight, Loader2, Mail, UserPlus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BilliLogo from '@/components/BilliLogo';
import { useToast } from '@/hooks/use-toast';
import { lovable } from '@/integrations/lovable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewMode = 'initial' | 'login' | 'signup';

const GoogleIcon: React.FC = React.memo(() => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
));

const LoginPage: React.FC = () => {
  const { t, setLanguage, setCurrency, language, currency } = useApp();
  const { signUp, signIn } = useAuthContext();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    country: 'CA',
    gender: '' as 'M' | 'F' | 'O' | '',
  });

  const countriesList = [
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  ];

  const validateFullName = (name: string): boolean => {
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (result.error) {
        toast({
          title: t('error'),
          description: result.error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: t('error'),
        description: err instanceof Error ? err.message : 'Google sign in failed',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateFullName(formData.name)) {
      toast({
        title: t('error'),
        description: t('fullNameRequired') || 'Please enter your full name (first and last name)',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, formData.name, formData.phone, formData.country, formData.city, language, currency);
      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✉️ ' + t('checkEmail'),
          description: t('confirmationSent'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInitialView = () => (
    <div className="w-full max-w-sm space-y-6 relative z-10">
      {/* Login Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-center text-white/90">{t('login')}</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Email Login Card */}
          <button
            onClick={() => setViewMode('login')}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium">{t('email')}</span>
          </button>

          {/* Google Login Card */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-colors"
          >
            {googleLoading ? (
              <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                  <GoogleIcon />
                </div>
                <span className="text-sm font-medium">Google</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-white/20"></div>
        <span className="flex-shrink mx-4 text-white/60 text-sm">{t('or')}</span>
        <div className="flex-grow border-t border-white/20"></div>
      </div>

      {/* Signup Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-center text-white/90">{t('createAccount') || 'Create Account'}</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Email Signup Card */}
          <button
            onClick={() => setViewMode('signup')}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-medium">{t('email')}</span>
          </button>

          {/* Google Signup Card */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-colors"
          >
            {googleLoading ? (
              <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                  <GoogleIcon />
                </div>
                <span className="text-sm font-medium">Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 relative z-10">
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{t('login')}</h2>
          <button
            type="button"
            onClick={() => setViewMode('initial')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t('back') || 'Back'}
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('enterEmail')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-secondary border-border"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="bg-secondary border-border"
            required
            minLength={6}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 btn-primary text-primary-foreground font-semibold text-lg rounded-2xl"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {t('login')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-muted-foreground/30"></div>
        <span className="flex-shrink mx-4 text-muted-foreground text-sm">{t('or')}</span>
        <div className="flex-grow border-t border-muted-foreground/30"></div>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full h-12 bg-card hover:bg-secondary text-foreground font-medium rounded-2xl border-2 border-border flex items-center justify-center gap-3"
      >
        {googleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <GoogleIcon />
            {t('continueWithGoogle')}
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={() => setViewMode('signup')}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('noAccount')} {t('signUpNow')}
      </button>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4 relative z-10">
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{t('signup')}</h2>
          <button
            type="button"
            onClick={() => setViewMode('initial')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t('back') || 'Back'}
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">{t('fullName') || 'Full Name'}</Label>
          <Input
            id="name"
            placeholder={t('enterFullName') || 'Enter your full name'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-secondary border-border"
            required
          />
          <p className="text-xs text-muted-foreground">
            {t('fullNameHint') || 'Please enter first and last name'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-secondary border-border"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email">{t('email')}</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder={t('enterEmail')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-secondary border-border"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">{t('password')}</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="bg-secondary border-border"
            required
            minLength={6}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t('country')}</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder={t('selectCountry')} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countriesList.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('city')}</Label>
            <Input
              placeholder={t('cityPlaceholder')}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-secondary border-border"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('gender')}</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value as 'M' | 'F' | 'O' })}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">{t('male')}</SelectItem>
              <SelectItem value="F">{t('female')}</SelectItem>
              <SelectItem value="O">{t('other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t('language')}</Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as 'pt' | 'en' | 'fr' | 'es' | 'it' | 'de')}
            >
              <SelectTrigger className="bg-secondary border-border">
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
          
          <div className="space-y-2">
            <Label>{t('currency')}</Label>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as any)}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
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
                <SelectItem value="HKD">HK$ HKD</SelectItem>
                <SelectItem value="NZD">NZ$ NZD</SelectItem>
                <SelectItem value="SEK">kr SEK</SelectItem>
                <SelectItem value="NOK">kr NOK</SelectItem>
                <SelectItem value="DKK">kr DKK</SelectItem>
                <SelectItem value="PLN">zł PLN</SelectItem>
                <SelectItem value="ZAR">R ZAR</SelectItem>
                <SelectItem value="AED">د.إ AED</SelectItem>
                <SelectItem value="THB">฿ THB</SelectItem>
                <SelectItem value="MYR">RM MYR</SelectItem>
                <SelectItem value="PHP">₱ PHP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 btn-primary text-primary-foreground font-semibold text-lg rounded-2xl"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {t('signup')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={() => setViewMode('login')}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('hasAccount')} {t('signInNow')}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
        
        {/* Logo Section */}
        <div className="relative z-10 text-center mb-6">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <BilliLogo size={100} />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-1">Billi</h1>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mt-3">
            <span className="text-xs text-white font-medium">{t('saveTogetherShort')}</span>
          </div>
        </div>

        {/* Dynamic Content */}
        {viewMode === 'initial' && renderInitialView()}
        {viewMode === 'login' && renderLoginForm()}
        {viewMode === 'signup' && renderSignupForm()}
      </div>
    </div>
  );
};

export default LoginPage;
