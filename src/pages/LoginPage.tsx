import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t, setUser, setLanguage, setCurrency, language } = useApp();
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    gender: '' as 'M' | 'F' | 'O' | '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      id: '1',
      name: formData.name || 'Bilionário',
      email: formData.email,
      country: formData.country,
      gender: (formData.gender || 'O') as 'M' | 'F' | 'O',
      isPremium: false,
      consistencyDays: 45,
      maxSaved: 2500,
      totalBalance: 77500,
    });
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Finanças Sociais Gamificadas</span>
          </div>
          
          <h1 className="text-5xl font-black mb-2">
            <span className="gradient-text">Billi</span>
          </h1>
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
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border"
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
                        <SelectValue placeholder="País" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                        <SelectItem value="US">🇺🇸 EUA</SelectItem>
                        <SelectItem value="CA">🇨🇦 Canadá</SelectItem>
                        <SelectItem value="FR">🇫🇷 França</SelectItem>
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
                        <SelectValue placeholder="Sexo" />
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
                        <SelectItem value="pt">🇧🇷 Português</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('currency')}</Label>
                    <Select
                      defaultValue="BRL"
                      onValueChange={(value) => setCurrency(value as 'BRL' | 'USD' | 'EUR' | 'CAD')}
                    >
                      <SelectTrigger className="bg-secondary border-border">
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
              </>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-14 btn-primary text-primary-foreground font-semibold text-lg rounded-2xl"
          >
            {isSignup ? t('signup') : t('login')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignup ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
