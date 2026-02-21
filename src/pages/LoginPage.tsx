import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Mail, UserPlus, TrendingUp, Users, Trophy, ChevronDown, Flame, Target, Award, Quote } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BilliLogo from '@/components/BilliLogo';
import { useToast } from '@/hooks/use-toast';
import { lovable } from '@/integrations/lovable';
import { Link } from 'react-router-dom';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type ViewMode = 'initial' | 'login' | 'signup';

const GoogleIcon: React.FC = React.memo(() => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
));

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

const LoginPage: React.FC = () => {
  const { t, setLanguage, setCurrency, language, currency } = useApp();
  const { signUp, signIn } = useAuthContext();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', password: '', country: 'CA', gender: '' as 'M' | 'F' | 'O' | '',
  });

  const validateFullName = (name: string): boolean => {
    const words = name.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length >= 2;
  };

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) toast({ title: t('error'), description: result.error.message, variant: 'destructive' });
    } catch (err) {
      toast({ title: t('error'), description: err instanceof Error ? err.message : 'Google sign in failed', variant: 'destructive' });
    } finally { setGoogleLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!validateFullName(formData.name)) {
      toast({ title: t('error'), description: t('fullNameRequired') || 'Please enter your full name', variant: 'destructive' });
      setLoading(false); return;
    }
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name, formData.phone, formData.country, formData.city, language, currency);
      if (error) toast({ title: t('error'), description: error.message, variant: 'destructive' });
      else toast({ title: '✉️ ' + t('checkEmail'), description: t('confirmationSent') });
    } finally { setLoading(false); }
  };

  const featureKeys = [
    { icon: TrendingUp, titleKey: 'featureTrackTitle', descKey: 'featureTrackDesc' },
    { icon: Users, titleKey: 'featureSaveTogetherTitle', descKey: 'featureSaveTogetherDesc' },
    { icon: Trophy, titleKey: 'featureStreaksTitle', descKey: 'featureStreaksDesc' },
  ];

  const steps = [
    { icon: UserPlus, titleKey: 'landingStep1Title', descKey: 'landingStep1Desc', num: '01' },
    { icon: Target, titleKey: 'landingStep2Title', descKey: 'landingStep2Desc', num: '02' },
    { icon: Flame, titleKey: 'landingStep3Title', descKey: 'landingStep3Desc', num: '03' },
    { icon: Award, titleKey: 'landingStep4Title', descKey: 'landingStep4Desc', num: '04' },
  ];

  const faqItems = [
    { q: 'faqQ1', a: 'faqA1' },
    { q: 'faqQ2', a: 'faqA2' },
    { q: 'faqQ3', a: 'faqA3' },
    { q: 'faqQ5', a: 'faqA5' },
    { q: 'faqQ6', a: 'faqA6' },
    { q: 'faqQ7', a: 'faqA7' },
    { q: 'faqQ8', a: 'faqA8' },
    { q: 'faqQ9', a: 'faqA9' },
  ];

  const renderInitialView = () => (
    <div className="w-full space-y-5">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">{t('login')}</h2>
        <Button type="button" onClick={() => setViewMode('login')} variant="outline"
          className="w-full h-12 rounded-xl border-border bg-card hover:bg-secondary flex items-center justify-center gap-3 text-foreground font-medium">
          <Mail className="w-5 h-5" />{t('continueWithEmail')}
        </Button>
        <Button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} variant="outline"
          className="w-full h-12 rounded-xl border-border bg-card hover:bg-secondary flex items-center justify-center gap-3 text-foreground font-medium">
          {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><GoogleIcon /> {t('continueWithGoogle')}</>}
        </Button>
      </div>
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-border" />
        <span className="flex-shrink mx-4 text-muted-foreground text-sm">{t('or')}</span>
        <div className="flex-grow border-t border-border" />
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">{t('createAccount')}</h2>
        <Button type="button" onClick={() => setViewMode('signup')}
          className="w-full h-12 rounded-xl btn-primary text-primary-foreground font-semibold flex items-center justify-center gap-3">
          <UserPlus className="w-5 h-5" />{t('signUpNow')}
        </Button>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-foreground">{t('login')}</h2>
        <button type="button" onClick={() => setViewMode('initial')} className="text-sm text-muted-foreground hover:text-foreground">← {t('back')}</button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" type="email" placeholder={t('enterEmail')} value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 bg-card border-border rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('password')}</Label>
          <Input id="password" type="password" placeholder="••••••••" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-11 bg-card border-border rounded-xl" required minLength={6} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 btn-primary text-primary-foreground font-semibold rounded-xl">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('login')} <ArrowRight className="w-5 h-5 ml-2" /></>}
      </Button>
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-border" /><span className="flex-shrink mx-4 text-muted-foreground text-sm">{t('or')}</span><div className="flex-grow border-t border-border" />
      </div>
      <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={googleLoading}
        className="w-full h-11 bg-card hover:bg-secondary text-foreground font-medium rounded-xl border-border flex items-center justify-center gap-3">
        {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><GoogleIcon /> {t('continueWithGoogle')}</>}
      </Button>
      <button type="button" onClick={() => setViewMode('signup')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        {t('noAccount')} <span className="text-primary font-medium">{t('signUpNow')}</span>
      </button>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSignup} className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-foreground">{t('signup')}</h2>
        <button type="button" onClick={() => setViewMode('initial')} className="text-sm text-muted-foreground hover:text-foreground">← {t('back')}</button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('fullName')}</Label>
          <Input id="name" placeholder={t('enterFullName')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 bg-card border-border rounded-xl" required />
          <p className="text-xs text-muted-foreground">{t('fullNameHint')}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-11 bg-card border-border rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">{t('email')}</Label>
          <Input id="signup-email" type="email" placeholder={t('enterEmail')} value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 bg-card border-border rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">{t('password')}</Label>
          <Input id="signup-password" type="password" placeholder="••••••••" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-11 bg-card border-border rounded-xl" required minLength={6} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('country')}</Label>
            <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
              <SelectTrigger className="h-11 bg-card border-border rounded-xl"><SelectValue placeholder={t('selectCountry')} /></SelectTrigger>
              <SelectContent className="max-h-60">
                {countriesList.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('city')}</Label>
            <Input placeholder={t('cityPlaceholder')} value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-11 bg-card border-border rounded-xl" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('gender')}</Label>
          <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as 'M' | 'F' | 'O' })}>
            <SelectTrigger className="h-11 bg-card border-border rounded-xl"><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M">{t('male')}</SelectItem>
              <SelectItem value="F">{t('female')}</SelectItem>
              <SelectItem value="O">{t('other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('language')}</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
              <SelectTrigger className="h-11 bg-card border-border rounded-xl"><SelectValue /></SelectTrigger>
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
          <div className="space-y-1.5">
            <Label>{t('currency')}</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
              <SelectTrigger className="h-11 bg-card border-border rounded-xl"><SelectValue /></SelectTrigger>
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
      <Button type="submit" disabled={loading} className="w-full h-12 btn-primary text-primary-foreground font-semibold rounded-xl">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('signup')} <ArrowRight className="w-5 h-5 ml-2" /></>}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        {t('agreeToTerms')}{' '}<Link to="/privacy" className="text-primary hover:underline">{t('privacyPolicy')}</Link>
        {' & '}<Link to="/terms" className="text-primary hover:underline">{t('termsOfUse')}</Link>
      </p>
      <button type="button" onClick={() => setViewMode('login')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        {t('hasAccount')} <span className="text-primary font-medium">{t('signInNow')}</span>
      </button>
    </form>
  );

  const renderAuthForm = () => {
    if (viewMode === 'login') return renderLoginForm();
    if (viewMode === 'signup') return renderSignupForm();
    return renderInitialView();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <BilliLogo size={36} />
            <span className="text-xl font-black text-foreground tracking-tight">Billi</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={scrollToAuth} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('landingSignIn')}
            </button>
            <Button onClick={() => { scrollToAuth(); setViewMode('signup'); }} size="sm" className="rounded-full btn-primary text-primary-foreground font-semibold px-5">
              {t('landingGetStarted')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section — Split layout like Plinq */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text content */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t('saveTogetherShort')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-foreground leading-[1.1] mb-5">
                {t('landingHeroTitle')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-3">
                {t('landingHeroSubtitle')}
              </p>
              <p className="text-base italic font-medium text-primary/80 mb-8">
                {t('romanticizeYourSavings')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Button onClick={() => { scrollToAuth(); setViewMode('signup'); }} size="lg" className="rounded-full btn-primary text-primary-foreground font-bold px-8 h-13 text-base">
                  {t('landingGetStarted')} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button onClick={scrollToAuth} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('landingAlreadyHaveAccount')} <span className="text-primary font-semibold">{t('landingSignIn')}</span>
                </button>
              </div>
            </motion.div>

            {/* Right: Feature cards */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }} className="flex-1 w-full max-w-md">
              <div className="space-y-4">
                {featureKeys.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * i + 0.3 }}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{t(f.titleKey)}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{t(f.descKey)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is Billi */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">{t('landingWhatIsBilli')}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t('landingWhatIsBilliDesc')}
          </p>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-black text-foreground text-center mb-14">{t('landingHowItWorks')}</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 * i }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <s.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">{s.num}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-black text-foreground text-center mb-12">{t('landingTestimonials')}</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.12 * i }}
                className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm relative">
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
                  "{t(`testimonial${i}Text`)}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{t(`testimonial${i}Name`).charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(`testimonial${i}Name`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`testimonial${i}Role`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-foreground text-center mb-12">{t('landingFAQ')}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/60 rounded-2xl bg-card px-6 overflow-hidden">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {t(faq.q)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {t(faq.a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* Auth Section */}
      <section ref={authRef} className="py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <BilliLogo size={56} className="mx-auto mb-4 justify-center" />
            <h2 className="text-2xl font-bold text-foreground">
              {viewMode === 'signup' ? t('createAccount') : t('welcomeBack')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {viewMode === 'signup' ? t('signUpDescription') : t('loginDescription')}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm">
            {renderAuthForm()}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BilliLogo size={24} />
            <span className="font-semibold text-foreground">Billi</span>
            <span>© {new Date().getFullYear()} {t('landingFooterRights')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('privacyPolicy')}</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('termsOfUse')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
