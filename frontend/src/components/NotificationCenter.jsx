import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const NotificationCenter = () => {
  const { groupNotifications, clearGroupNotifications } = useChatStore();
  const { userProfile } = useAuthStore();

  const getTotalNotifications = () => {
    return Object.values(groupNotifications).reduce((total, notifications) => total + notifications.length, 0);
  };

  const handleNotificationClick = () => {
    // Implement notification viewing logic here
    console.log('Viewing notifications');
  };

  useEffect(() => {
    // Clear notifications when the component unmounts
    return () => {
      Object.keys(groupNotifications).forEach(chatId => {
        clearGroupNotifications(chatId);
      });
    };
  }, []);

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-sm relative"
        aria-label="Notifications"
        onClick={handleNotificationClick}
      >
        <Bell className="w-5 h-5" />
        {getTotalNotifications() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {getTotalNotifications()}
          </span>
        )}
      </button>
      {/* Implement a dropdown or modal to show notifications */}
    </div>
  );
};

export default NotificationCenter;

