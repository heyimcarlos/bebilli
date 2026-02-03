import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  category: string;
  onJoin: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  name,
  description,
  image,
  members,
  category,
  onJoin,
}) => {
  const { t } = useApp();

  return (
    <div className="glass-card overflow-hidden group">
      <div className="relative h-40">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-4 -mt-8 relative">
        <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{members.toLocaleString()} {t('members')}</span>
          </div>
          
          <Button
            onClick={onJoin}
            size="sm"
            className="btn-primary text-primary-foreground font-semibold px-4"
          >
            {t('join')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
