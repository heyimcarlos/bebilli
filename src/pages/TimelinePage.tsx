import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, TrendingUp, Star, Zap, Globe, Loader2, UserPlus, DollarSign, Target } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  is_anonymous: boolean;
  created_at: string;
  username?: string;
  avatar_url?: string;
  highFived?: boolean;
  highFiveCount?: number;
}

const TimelinePage: React.FC = () => {
  const { t, formatCurrency } = useApp();
  const { user } = useAuthContext();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [highFives, setHighFives] = useState<Record<string, boolean>>({});

  const fetchEvents = async () => {
    setLoading(true);

    let followingIds: string[] = [];
    if (user) {
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

    if (followingIds.length > 0) {
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
        highFived: false,
        highFiveCount: 0,
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
  }, [user]);

  const toggleHighFive = (eventId: string) => {
    setHighFives(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'streak_milestone': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'goal_completed': return <Trophy className="w-4 h-4 text-accent" />;
      case 'level_up': return <Star className="w-4 h-4 text-primary" />;
      case 'consistency_top': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'check_in_milestone': return <Zap className="w-4 h-4 text-primary" />;
      case 'new_follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'contribution': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'group_joined': return <Target className="w-4 h-4 text-primary" />;
      default: return <Star className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventBody = (event: TimelineEvent) => {
    const data = event.event_data;
    switch (event.event_type) {
      case 'contribution':
        return (
          <div className="space-y-1">
            {data.caption && <p className="text-sm text-foreground">{data.caption}</p>}
            <p className="text-xs text-muted-foreground">
              {t('madeContribution') || 'Made a contribution'} {data.group_name ? `${t('in') || 'in'} ${data.group_name}` : ''} {data.amount ? `— ${formatCurrency(data.amount)}` : ''} 💰
            </p>
          </div>
        );
      case 'streak_milestone':
        return <p className="text-sm text-foreground">{data.days || 0} {t('daysOfDiscipline') || 'days of discipline'} 🔥</p>;
      case 'goal_completed':
        return <p className="text-sm text-foreground">{t('completedGoal') || 'Completed a goal'}: {data.category || '🎯'} 🏆</p>;
      case 'level_up':
        return <p className="text-sm text-foreground">{t('reachedLevel') || 'Reached level'} {data.level || 0} — {data.title || 'Builder'} ⭐</p>;
      case 'check_in_milestone':
        return <p className="text-sm text-foreground">{t('completedCheckins') || 'Completed'} {data.count || 0} check-ins 💪</p>;
      case 'new_follow':
        return <p className="text-sm text-foreground">@{data.follower_name || 'Someone'} {t('nowFollows') || 'now follows'} @{data.following_name || 'someone'} 🤝</p>;
      case 'group_joined':
        return <p className="text-sm text-foreground">{t('joinedGroup') || 'Joined'} {data.group_name || ''} 🎯</p>;
      default:
        return <p className="text-sm text-foreground">{t('achievedSomething') || 'Achieved something great!'} ✨</p>;
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

  const groupByDate = (events: TimelineEvent[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sections: { label: string; events: TimelineEvent[] }[] = [
      { label: t('today') || 'Today', events: [] },
      { label: t('yesterday') || 'Yesterday', events: [] },
      { label: t('thisWeek') || 'This Week', events: [] },
      { label: t('earlier') || 'Earlier', events: [] },
    ];

    events.forEach(e => {
      const d = new Date(e.created_at);
      if (d.toDateString() === today.toDateString()) sections[0].events.push(e);
      else if (d.toDateString() === yesterday.toDateString()) sections[1].events.push(e);
      else if (d > weekAgo) sections[2].events.push(e);
      else sections[3].events.push(e);
    });

    return sections.filter(s => s.events.length > 0);
  };

  const sections = groupByDate(events);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-3">
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">{t('noFollowingActivity') || 'No activity from people you follow'}</h3>
              <p className="text-sm text-muted-foreground">{t('followPeopleTip') || 'Follow people to see their updates here!'}</p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {sections.map(section => (
              <div key={section.label}>
                <Badge variant="secondary" className="mb-3 text-xs">{section.label}</Badge>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {section.events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Card className="p-4">
                          {/* Header: Avatar + name + time + icon */}
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={event.avatar_url || undefined} />
                              <AvatarFallback className="bg-secondary text-xs">
                              {event.is_anonymous ? '?' : (event.username?.charAt(0)?.toUpperCase() || '?')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {event.is_anonymous ? (t('aBillionaire') || 'A Billionaire') : `@${event.username || 'Billionaire'}`}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{formatTime(event.created_at)}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                              {getEventIcon(event.event_type)}
                            </div>
                          </div>

                          {/* Body */}
                          <div className="pl-12">
                            {getEventBody(event)}
                          </div>

                          {/* High Five reaction */}
                          <div className="pl-12 mt-3">
                            <button
                              onClick={() => toggleHighFive(event.id)}
                              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
                                highFives[event.id]
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                              }`}
                            >
                              🙌 {highFives[event.id] ? 1 : 0}
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
