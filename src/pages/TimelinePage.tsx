import React, { useState } from 'react';
import { Search, Upload, Image } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import CommunityCard from '@/components/CommunityCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const TimelinePage: React.FC = () => {
  const { communities, t } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(false);

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = (name: string) => {
    toast({
      title: '🎉 Você entrou!',
      description: `Bem-vindo à comunidade ${name}`,
    });
  };

  const handlePost = () => {
    toast({
      title: '✨ Conquista publicada!',
      description: 'Sua conquista foi compartilhada com a comunidade',
    });
    setPostModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold mb-6">{t('timeline')}</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-secondary border-border rounded-xl"
          />
        </div>

        <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 btn-primary text-primary-foreground font-semibold rounded-xl">
              <Upload className="w-5 h-5 mr-2" />
              {t('postAchievement')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{t('postAchievement')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Compartilhe sua conquista..."
                className="bg-secondary min-h-24"
              />
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-center text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Adicionar imagem</span>
                </div>
              </div>
              <Button
                onClick={handlePost}
                className="w-full btn-primary text-primary-foreground"
              >
                Publicar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Community Feed */}
      <div className="px-6 space-y-4">
        {filteredCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            {...community}
            onJoin={() => handleJoin(community.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelinePage;
