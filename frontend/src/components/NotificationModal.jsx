import React from 'react';
import { X } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';

const NotificationModal = ({ isOpen, onClose }) => {
  const { selectChat } = useChatStore();
  const { notifications, markNotificationAsRead, clearNotifications } = useNotificationStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification._id);
    selectChat(notification.chat);
    navigate(`/chat/${notification.chat}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border-b border-gray-200 py-2 last:border-b-0 cursor-pointer hover:bg-gray-100 transition duration-200 ${
                  !notification.read ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center">
                  {!notification.read && (
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                  )}
                  <p className="flex-1">{notification.content}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => {
            clearNotifications();
            onClose();
          }}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Clear All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;