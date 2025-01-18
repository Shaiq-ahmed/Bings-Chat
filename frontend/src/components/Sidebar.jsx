import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useNavigate } from "react-router-dom";
import { User, Users, Plus, Bell , Inbox} from 'lucide-react';
import { formatChatLastDate } from "../lib/date-pattern";
import SearchUser from "./SearchUser";
import GroupChatModal from "./GroupChatModal";
import NotificationModal from "./NotificationModal";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getChats, chats, selectChat, selectedChat, isChatsLoading, resetUnreadCount } = useChatStore();
  const { userProfile, onlineUsers } = useAuthStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    getChats();
    fetchNotifications();
  }, [getChats, fetchNotifications]);

  if(isChatsLoading) return <SidebarSkeleton/>;

  const getUnreadNotificationsCount = () => {
    // console.log(notifications.map(n => n.read));
    return  0;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6" />
            <span className="font-medium">Chats</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="btn btn-ghost btn-sm relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {getUnreadNotificationsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getUnreadNotificationsCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="btn btn-ghost btn-sm"
              aria-label="Create Group Chat"
            >
              <Users className="w-5 h-5 mr-1" />
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <SearchUser />
      </div>

      <div className="overflow-y-auto">
      {chats?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Inbox className="w-24 h-24 mb-4 text-gray-400" /> 
            <h2 className="text-lg font-semibold">No Chats Found</h2>
            <p className="text-gray-500">Start a conversation by searching for users.</p>
          </div>
        ) : (chats?.map((chat) => (
          <button
            key={chat._id}
            onClick={() => {
              selectChat(chat._id);
              resetUnreadCount(chat._id);
              navigate(`/chat/${chat._id}`);
            }}
            className={`
              w-full p-3 flex items-center gap-3
              border-b border-gray-200
              hover:bg-base-300 transition-colors
              ${selectedChat?._id === chat._id ? "bg-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={
                  chat?.isGroupChat
                    ? chat?.img || "/avatar.png"
                    : chat?.users?.find((user) => user._id !== userProfile._id)
                        ?.avatar || "/avatar.png"
                }
                alt={chat.latestMessage?.sender?.name || "Chat"}
                className="w-12 h-12 object-cover rounded-full"
              />
              {!chat?.isGroupChat &&
                chat?.users?.some(
                  (user) =>
                    user._id !== userProfile._id &&
                    onlineUsers.includes(user._id)
                ) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                )}
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium truncate">
                {chat?.isGroupChat
                  ? chat?.chatName
                  : chat?.users?.find((user) => user._id !== userProfile._id)
                      ?.name || "Unknown User"}
              </div>
              <div className="text-sm text-zinc-400 truncate">
                {chat.latestMessage
                  ? chat.latestMessage.text
                  : "No messages yet"}
              </div>
            </div>
            {chat.latestMessage && (
              <div className="text-sm text-zinc-400 flex items-center">
                <time className="text-xs opacity-50 ml-1">
                  {formatChatLastDate(chat.latestMessage.createdAt)}
                </time>
              </div>
            )}
          </button>
        ))
      )}
      </div>
      <GroupChatModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;

