import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  type: 'contribution' | 'achievement' | 'milestone' | 'welcome' | 'reaction' | 'follow_request' | 'follow_accepted' | 'group_join' | 'checkin' | 'level_up' | 'goal_completed' | 'info';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  requestPermission: () => Promise<boolean>;
  permissionGranted: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch notifications from DB
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data.map(n => ({
          id: n.id,
          type: n.type as Notification['type'],
          title: n.title,
          message: n.message,
          data: n.data as Record<string, any>,
          timestamp: new Date(n.created_at),
          read: n.read,
        })));
      }
    };

    fetchNotifications();

    // Realtime subscription for new notifications
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as any;
          const newNotif: Notification = {
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            data: n.data,
            timestamp: new Date(n.created_at),
            read: false,
          };
          setNotifications(prev => [newNotif, ...prev]);
          
          // Show toast and browser notification
          toast({ title: n.title, description: n.message });
          if (permissionGranted && 'Notification' in window) {
            new window.Notification(n.title, { body: n.message, icon: '/favicon.ico', tag: 'billi-' + n.id });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, permissionGranted]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({ title: 'Notificações não suportadas', description: 'Seu navegador não suporta notificações push.', variant: 'destructive' });
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      if (granted) {
        toast({ title: 'Notificações ativadas! 🔔', description: 'Você receberá alertas em tempo real.' });
      }
      return granted;
    } catch {
      return false;
    }
  }, []);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!userId) return;
    // Insert into DB - realtime subscription will handle updating state
    await supabase.from('notifications').insert({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
    });
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (userId) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    }
  }, [userId]);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    if (userId) {
      await supabase.from('notifications').delete().eq('user_id', userId);
    }
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications, requestPermission, permissionGranted }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
