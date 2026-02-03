import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billiLogo from '@/assets/billi-logo.png';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LoginPage: React.FC = () => {
  const { t, setLanguage, setCurrency, language, currency } = useApp();
  const { signUp, signIn } = useAuthContext();
  const { toast } = useToast();
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: 'CA',
    gender: '' as 'M' | 'F' | 'O' | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: 'We sent you a confirmation link to verify your account.',
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 text-center mb-8">
          <img
            src={billiLogo}
            alt="Billi"
            className="w-32 h-32 mx-auto mb-4 animate-float"
          />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <span className="text-sm text-primary font-medium">Gamified Social Finance</span>
          </div>
          
          <p className="text-muted-foreground text-lg">
            {t('welcome')}, <span className="gradient-gold-text font-semibold">{t('billionaire')}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 relative z-10">
          <div className="glass-card p-6 space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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

            {isSignup && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t('country')}</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                        <SelectItem value="US">🇺🇸 USA</SelectItem>
                        <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                        <SelectItem value="FR">🇫🇷 France</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t('language')}</Label>
                    <Select
                      value={language}
                      onValueChange={(value) => setLanguage(value as 'pt' | 'en' | 'fr')}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇨🇦 English</SelectItem>
                        <SelectItem value="fr">🇨🇦 Français</SelectItem>
                        <SelectItem value="pt">🇧🇷 Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('currency')}</Label>
                    <Select
                      value={currency}
                      onValueChange={(value) => setCurrency(value as 'BRL' | 'USD' | 'EUR' | 'CAD')}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAD">$ CAD</SelectItem>
                        <SelectItem value="USD">US$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                        <SelectItem value="BRL">R$ BRL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
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
                {isSignup ? t('signup') : t('login')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
