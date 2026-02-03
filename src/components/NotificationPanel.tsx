import React from 'react';
import { X, Bell, BellOff, Check, Trash2, TrendingUp, Gift, Users, Heart } from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, fr } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupClick?: (groupId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onGroupClick }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, requestPermission, permissionGranted, unreadCount } = useNotifications();
  const { language, t } = useApp();

  const getLocale = () => {
    switch (language) {
      case 'pt': return ptBR;
      case 'fr': return fr;
      default: return enUS;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'contribution':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'milestone':
        return <Gift className="w-5 h-5 text-primary" />;
      case 'achievement':
        return <Gift className="w-5 h-5 text-accent" />;
      case 'welcome':
        return <Users className="w-5 h-5 text-primary" />;
      case 'reaction':
        return <Heart className="w-5 h-5 text-pink-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.groupId && onGroupClick) {
      onGroupClick(notification.groupId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('notifications')}</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner */}
        {!permissionGranted && (
          <div className="p-4 bg-primary/10 border-b border-border">
            <div className="flex items-start gap-3">
              <BellOff className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('enableNotifications')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('enableNotificationsDesc')}</p>
                <Button
                  size="sm"
                  onClick={requestPermission}
                  className="mt-2 btn-primary text-primary-foreground"
                >
                  {t('enable')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="w-4 h-4 mr-1" />
              {t('markAllRead')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t('clearAll')}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.read ? 'bg-primary/20' : 'bg-secondary'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: getLocale() })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
