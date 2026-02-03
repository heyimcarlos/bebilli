import React, { useState } from 'react';
import { ArrowLeft, Rocket, Turtle, Send, Bot, Lock, Check, Gift } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GroupPageProps {
  groupId: string;
  onBack: () => void;
}

const GroupPage: React.FC<GroupPageProps> = ({ groupId, onBack }) => {
  const { groups, t, formatCurrency } = useApp();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; name: string; content: string; isBot?: boolean }>>([]);

  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  const progress = (group.current / group.goal) * 100;

  const partners = [
    { name: 'Decolar', logo: '✈️', discount: '15% OFF', unlockAt: 25 },
    { name: 'Booking', logo: '🏨', discount: '20% OFF', unlockAt: 50 },
    { name: 'Airbnb', logo: '🏠', discount: '25% OFF', unlockAt: 75 },
    { name: 'JAL Airlines', logo: '🛫', discount: '30% OFF', unlockAt: 100 },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      { id: Date.now().toString(), name: 'Você', content: message },
    ]);
    setMessage('');
  };

  const isLastWeek = (date: Date) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date < weekAgo;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48">
          <img
            src={group.image}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        
        <div className="relative z-10 px-6 pt-12 pb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
          <p className="text-muted-foreground text-sm">{group.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('groupGoal')}</span>
            <span className="text-sm font-semibold text-primary">{progress.toFixed(0)}% {t('reached')}</span>
          </div>
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{formatCurrency(group.current)}</span>
            <span className="font-semibold">{formatCurrency(group.goal)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="w-full bg-secondary mb-4">
            <TabsTrigger value="ranking" className="flex-1">{t('ranking')}</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">{t('chat')}</TabsTrigger>
            <TabsTrigger value="dream" className="flex-1">{t('dreamPanel')}</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="space-y-3">
            {group.members.map((member, index) => (
              <div
                key={member.id}
                className="glass-card p-4 flex items-center gap-4"
              >
                {index === 0 ? (
                  <div className="badge-rocket">
                    <Rocket className="w-4 h-4 text-primary-foreground" />
                  </div>
                ) : isLastWeek(member.lastContribution) ? (
                  <div className="badge-turtle">
                    <Turtle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isLastWeek(member.lastContribution)
                      ? `${t('noContributions')} 7+ ${t('days')}`
                      : `${t('yourContribution')}: ${formatCurrency(member.contribution)}`}
                  </p>
                </div>
                
                <span className={`text-sm font-semibold ${index === 0 ? 'gradient-gold-text' : 'text-primary'}`}>
                  {formatCurrency(member.contribution)}
                </span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="glass-card p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
              {/* Bot welcome message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                  <p className="text-xs text-primary font-medium mb-1">Bili Bot</p>
                  <p className="text-sm">Bilionário Lucas acabou de contribuir R$ 500! 🚀</p>
                </div>
              </div>
              
              {group.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.isBot ? '' : 'justify-end'}`}>
                  {msg.isBot && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    msg.isBot ? 'bg-secondary rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}>
                    {msg.isBot && <p className="text-xs text-primary font-medium mb-1">{msg.userName}</p>}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-secondary"
              />
              <Button
                onClick={handleSendMessage}
                className="btn-primary text-primary-foreground w-12 h-12"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="dream" className="space-y-4">
            {/* Thermometer */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                {t('partners')}
              </h3>
              
              <div className="relative h-64 mb-6">
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-accent transition-all duration-1000"
                    style={{ height: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                {/* Milestones */}
                {[25, 50, 75, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className="absolute left-1/2 -translate-x-1/2 flex items-center"
                    style={{ bottom: `${milestone - 5}%` }}
                  >
                    <div className={`w-4 h-4 rounded-full ${progress >= milestone ? 'bg-success' : 'bg-muted'} flex items-center justify-center`}>
                      {progress >= milestone && <Check className="w-3 h-3 text-success-foreground" />}
                    </div>
                    <span className="ml-8 text-xs text-muted-foreground whitespace-nowrap">{milestone}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Cards */}
            <div className="grid grid-cols-2 gap-3">
              {partners.map((partner) => {
                const isUnlocked = progress >= partner.unlockAt;
                return (
                  <button
                    key={partner.name}
                    disabled={!isUnlocked}
                    className={`glass-card p-4 text-center transition-all ${
                      isUnlocked
                        ? 'hover:border-primary/50 cursor-pointer'
                        : 'grayscale opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-3xl mb-2">{partner.logo}</div>
                    <p className="font-medium text-sm">{partner.name}</p>
                    <p className={`text-xs ${isUnlocked ? 'text-success' : 'text-muted-foreground'}`}>
                      {partner.discount}
                    </p>
                    {!isUnlocked && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>{t('unlockAt')} {partner.unlockAt}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupPage;
