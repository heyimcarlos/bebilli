import React, { useState } from 'react';
import { Eye, EyeOff, Plus, Hash, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import GroupCard from '@/components/GroupCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HomePageProps {
  onGroupClick: (groupId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGroupClick }) => {
  const { user, groups, formatCurrency, t } = useApp();
  const [showBalance, setShowBalance] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  const totalBalance = groups.reduce((sum, g) => sum + g.current, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative px-6 pt-12 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-sm">Olá, {t('billionaire')}</p>
              <h1 className="text-2xl font-bold">{user?.name || 'Bilionário'}</h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Balance Card */}
          <div className="glass-card p-6 glow-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">{t('totalBalance')}</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black gradient-text">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% este mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 btn-primary text-primary-foreground font-semibold rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                {t('createGroup')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{t('createGroup')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Grupo</Label>
                  <Input placeholder="Ex: Viagem para Paris" className="bg-secondary" />
                </div>
                <div className="space-y-2">
                  <Label>Meta (R$)</Label>
                  <Input type="number" placeholder="50000" className="bg-secondary" />
                </div>
                <Button
                  onClick={() => setCreateModalOpen(false)}
                  className="w-full btn-primary text-primary-foreground"
                >
                  Criar Grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-14 border-border font-semibold rounded-xl">
                <Hash className="w-5 h-5 mr-2" />
                {t('enterCode')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{t('enterCode')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Código do Grupo</Label>
                  <Input placeholder="ABC123" className="bg-secondary text-center text-2xl tracking-widest" />
                </div>
                <Button
                  onClick={() => setCodeModalOpen(false)}
                  className="w-full btn-primary text-primary-foreground"
                >
                  Entrar no Grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Groups */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4">{t('myGroups')}</h2>
        <div className="space-y-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              image={group.image}
              goal={group.goal}
              current={group.current}
              membersCount={group.members.length}
              onClick={() => onGroupClick(group.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
