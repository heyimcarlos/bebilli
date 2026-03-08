import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, TrendingUp, Star, Zap, Globe, Loader2, UserPlus, DollarSign, Target } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  is_anonymous: boolean;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

const TimelinePage: React.FC = () => {
  const { t } = useApp();
  const { user } = useAuthContext();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const fetchEvents = async () => {
    setLoading(true);
    
    let followingIds: string[] = [];
    if (user && filter === 'following') {
      const { data: followData } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .eq('status', 'accepted');
      followingIds = (followData || []).map((f: any) => f.following_id);
      if (user.id) followingIds.push(user.id);
    }

    let query = supabase
      .from('timeline_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'following' && followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    }

    const { data, error } = await query;

    if (!error && data) {
      const typedData = data as any[];
      const userIds = [...new Set(typedData.filter((e: any) => !e.is_anonymous).map((e: any) => e.user_id))];
      let profileMap: Record<string, { name: string; avatar_url: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', userIds);
        (profiles as any[])?.forEach((p: any) => {
          profileMap[p.id] = { name: p.username || p.name, avatar_url: p.avatar_url };
        });
      }

      setEvents(typedData.map((e: any) => ({
        ...e,
        event_data: (e.event_data as Record<string, any>) || {},
        username: e.is_anonymous ? undefined : profileMap[e.user_id]?.name,
        avatar_url: e.is_anonymous ? undefined : profileMap[e.user_id]?.avatar_url,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel('timeline-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline_events' }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter, user]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'streak_milestone': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'goal_completed': return <Trophy className="w-5 h-5 text-accent" />;
      case 'level_up': return <Star className="w-5 h-5 text-primary" />;
      case 'consistency_top': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'check_in_milestone': return <Zap className="w-5 h-5 text-primary" />;
      case 'new_follow': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'contribution': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'group_joined': return <Target className="w-5 h-5 text-primary" />;
      default: return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getEventMessage = (event: TimelineEvent) => {
    const actor = event.is_anonymous
      ? (t('aBillionaire') || 'A Billionaire')
      : `@${event.username || 'Billionaire'}`;
    const data = event.event_data;

    switch (event.event_type) {
      case 'streak_milestone':
        return `${actor} ${t('reached') || 'reached'} ${data.days || 0} ${t('daysOfDiscipline') || 'days of discipline'} 🔥`;
      case 'goal_completed':
        return `${actor} ${t('completedGoal') || 'completed a goal'}: ${data.category || '🎯'} 🏆`;
      case 'level_up':
        return `${actor} ${t('reachedLevel') || 'reached level'} ${data.level || 0} — ${data.title || 'Builder'} ⭐`;
      case 'consistency_top':
        return `${actor} ${t('enteredTop') || 'entered the Top'} ${data.percentage || 10}% ${t('inConsistency') || 'in consistency'}`;
      case 'check_in_milestone':
        return `${actor} ${t('completedCheckins') || 'completed'} ${data.count || 0} check-ins 💪`;
      case 'new_follow':
        return `@${data.follower_name || 'Someone'} ${t('nowFollows') || 'now follows'} @${data.following_name || 'someone'} 🤝`;
      case 'contribution':
        return `${actor} ${t('madeContribution') || 'made a contribution'} ${data.group_name ? `${t('in') || 'in'} ${data.group_name}` : ''} 💰`;
      case 'group_joined':
        return `${actor} ${t('joinedGroup') || 'joined'} ${data.group_name || ''} 🎯`;
      default:
        return `${actor} ${t('achievedSomething') || 'achieved something great!'} ✨`;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return t('justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('timelineFeed') || 'Feed'}</h1>
            <p className="text-muted-foreground text-sm">{t('timelineDesc') || 'Community achievements & updates'}</p>
          </div>
        </div>

        {/* Filter tabs */}
        {user && (
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg mb-4">
            <button onClick={() => setFilter('all')}
              className={`flex-1 text-xs py-2 rounded-md font-semibold transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {t('everyone') || 'Everyone'}
            </button>
            <button onClick={() => setFilter('following')}
              className={`flex-1 text-xs py-2 rounded-md font-semibold transition-colors ${filter === 'following' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {t('following') || 'Following'}
            </button>
          </div>
        )}
      </div>

      <div className="px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">{filter === 'following' ? (t('noFollowingActivity') || 'No activity from people you follow') : (t('noEventsYet') || 'No achievements yet')}</h3>
            <p className="text-sm text-muted-foreground">{filter === 'following' ? (t('followPeopleTip') || 'Follow people to see their updates here!') : (t('beFirstAchievement') || 'Start your streak to appear here!')}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{getEventMessage(event)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(event.created_at)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
