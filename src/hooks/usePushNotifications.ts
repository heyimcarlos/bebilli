import { useState, useEffect, useCallback } from 'react';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('Notifications not available or not permitted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/billi-icon-192.png',
        badge: '/billi-icon-192.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const sendMilestoneNotification = useCallback((milestone: number, groupName: string, reward?: string) => {
    const messages: Record<number, { title: string; body: string }> = {
      25: {
        title: '🎯 25% Milestone Reached!',
        body: `${groupName} is making great progress! Keep saving!`,
      },
      50: {
        title: '🔥 Halfway There!',
        body: `${groupName} reached 50%! You're on fire!`,
      },
      75: {
        title: '🚀 75% Complete!',
        body: `${groupName} is almost there! Final push!`,
      },
      100: {
        title: '🎉 Goal Achieved!',
        body: `Congratulations! ${groupName} reached 100%! ${reward || 'All rewards unlocked!'}`,
      },
    };

    const message = messages[milestone];
    if (message) {
      sendNotification(message.title, {
        body: message.body,
        tag: `milestone-${groupName}-${milestone}`,
        requireInteraction: milestone === 100,
      });
    }
  }, [sendNotification]);

  const sendContributionNotification = useCallback((userName: string, amount: number, groupName: string) => {
    sendNotification('💰 New Contribution!', {
      body: `${userName} added $${amount.toFixed(2)} to ${groupName}`,
      tag: `contribution-${Date.now()}`,
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendMilestoneNotification,
    sendContributionNotification,
  };
};
