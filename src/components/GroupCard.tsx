import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface GroupCardProps {
  id: string;
  name: string;
  image: string;
  goal: number;
  current: number;
  membersCount: number;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  name,
  image,
  goal,
  current,
  membersCount,
  onClick,
}) => {
  const { formatCurrency, t } = useApp();
  const progress = (current / goal) * 100;

  return (
    <button
      onClick={onClick}
      className="w-full glass-card p-4 hover:border-primary/30 transition-all duration-300 group text-left"
    >
      <div className="flex gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">{name}</h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Users className="w-3 h-3" />
            <span>{membersCount} {t('members')}</span>
          </div>
          
          <div className="progress-bar mb-1">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatCurrency(current)} {t('of')} {formatCurrency(goal)}
            </span>
            <span className="text-primary font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default GroupCard;
