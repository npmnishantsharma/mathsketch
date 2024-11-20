'use client'
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Theme } from "@/types";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Notification {
  id: string;
  userId: string;
  type: 'mention';
  from: string;
  message: string;
  timestamp: string;
}

interface NotificationBadgeProps {
  sessionId: string;
  userId: string;
  theme: Theme;
}

export default function NotificationBadge({ sessionId, userId, theme }: NotificationBadgeProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showBadge, setShowBadge] = useState(false);
  const rtdb = getDatabase();

  useEffect(() => {
    const notificationsRef = ref(rtdb, `sessions/${sessionId}/notifications`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const userNotifications = Object.entries(notificationsData)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }))
          .filter((notification: Notification) => notification.userId === userId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setNotifications(userNotifications);
        setShowBadge(userNotifications.length > 0);

        // Play notification sound if there are new mentions
        if (userNotifications.length > 0) {
          const audio = new Audio('/notification.mp3'); // Add a notification sound file
          audio.play().catch(error => console.log('Error playing notification sound:', error));
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, userId, rtdb]);

  const clearNotification = async (notificationId: string) => {
    try {
      const notificationRef = ref(rtdb, `sessions/${sessionId}/notifications/${notificationId}`);
      await remove(notificationRef);
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const promises = notifications.map(notification => 
        remove(ref(rtdb, `sessions/${sessionId}/notifications/${notification.id}`))
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            style={{ color: theme.text }}
          >
            <Bell className="h-5 w-5" />
            {showBadge && (
              <span 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: theme.primary, color: theme.text }}
              >
                {notifications.length}
              </span>
            )}
          </Button>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80"
        style={{ backgroundColor: theme.background, border: `1px solid ${theme.secondary}` }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllNotifications}
                style={{ color: theme.primary }}
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: theme.secondary }}>
                No new notifications
              </p>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className="flex items-start justify-between p-2 rounded"
                  style={{ backgroundColor: theme.secondary + '20' }}
                >
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{notification.from}</span> mentioned you
                    </p>
                    <p className="text-xs" style={{ color: theme.secondary }}>
                      {notification.message}
                    </p>
                    <p className="text-xs" style={{ color: theme.secondary }}>
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearNotification(notification.id)}
                    style={{ color: theme.primary }}
                  >
                    Clear
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 