import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'contribution' | 'achievement' | 'milestone' | 'welcome';
  title: string;
  message: string;
  groupId?: string;
  groupName?: string;
  userName?: string;
  amount?: number;
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

  useEffect(() => {
    // Check initial permission status
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }

    // Add some demo notifications
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'contribution',
        title: 'Nova contribuição! 🚀',
        message: 'Lucas Silva contribuiu R$ 500 no grupo Expedição Japão',
        groupId: '1',
        groupName: 'Expedição Japão',
        userName: 'Lucas Silva',
        amount: 500,
        timestamp: new Date(Date.now() - 300000),
        read: false,
      },
      {
        id: '2',
        type: 'milestone',
        title: 'Meta alcançada! 🎉',
        message: 'O grupo Expedição Japão atingiu 50% da meta!',
        groupId: '1',
        groupName: 'Expedição Japão',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: '3',
        type: 'contribution',
        title: 'Nova contribuição! 💰',
        message: 'Maria Santos contribuiu R$ 300 no grupo Garagem BYD',
        groupId: '2',
        groupName: 'Garagem BYD',
        userName: 'Maria Santos',
        amount: 300,
        timestamp: new Date(Date.now() - 7200000),
        read: true,
      },
    ];
    setNotifications(demoNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      
      if (granted) {
        toast({
          title: 'Notificações ativadas! 🔔',
          description: 'Você receberá alertas quando houver novas contribuições.',
        });
      }
      
      return granted;
    } catch {
      return false;
    }
  }, []);

  const sendPushNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permissionGranted && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'billi-notification',
      });
    }
  }, [permissionGranted]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show in-app toast
    toast({
      title: notification.title,
      description: notification.message,
    });

    // Send browser push notification
    sendPushNotification(notification.title, notification.message);
  }, [sendPushNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        requestPermission,
        permissionGranted,
      }}
    >
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
