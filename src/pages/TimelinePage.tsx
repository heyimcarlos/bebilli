import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useContributions } from '@/hooks/useContributions';
import { formatDistanceToNow } from 'date-fns';
import billiLogo from '@/assets/billi-logo.png';

interface TimelinePageProps {
  onGroupClick?: (groupId: string) => void;
}

const TimelinePage: React.FC<TimelinePageProps> = ({ onGroupClick }) => {
  const { formatCurrency, t } = useApp();
  const { user } = useAuthContext();
  const { contributions, loading } = useContributions(user?.id);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  // Group contributions by date
  const groupedByDate = contributions.reduce((acc, contribution) => {
    const date = new Date(contribution.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(contribution);
    return acc;
  }, {} as Record<string, typeof contributions>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('timeline')}</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-13">
          Recent activity from your groups
        </p>
      </div>

      {/* Timeline */}
      <div className="px-6">
        {contributions.length === 0 ? (
          <motion.div 
            className="glass-card p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No contributions yet</h3>
            <p className="text-sm text-muted-foreground">
              Join a group and start contributing to see activity here!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {Object.entries(groupedByDate).map(([date, dayContributions]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground font-medium px-2">
                    {date === new Date().toLocaleDateString() ? 'Today' : date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3">
                  {dayContributions.map((contribution) => (
                    <motion.div
                      key={contribution.id}
                      variants={item}
                      className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => onGroupClick?.(contribution.group_id)}
                      whileHover={{ scale: 1.01, x: 4 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary overflow-hidden flex-shrink-0">
                          {contribution.profile.avatar_url ? (
                            <img 
                              src={contribution.profile.avatar_url} 
                              alt={contribution.profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full p-2">
                              <img src={billiLogo} alt="Billi" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium truncate">{contribution.profile.name}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            contributed to <span className="text-foreground font-medium">{contribution.group.name}</span>
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold gradient-text">
                              +{formatCurrency(contribution.amount)}
                            </span>
                            
                            {contribution.note && (
                              <span className="text-xs text-muted-foreground italic truncate max-w-[150px]">
                                "{contribution.note}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
