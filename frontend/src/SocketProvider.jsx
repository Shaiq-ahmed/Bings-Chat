// import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
// import io from "socket.io-client";
// import { useAuthStore } from "./store/useAuthStore";
// import { useChatStore } from "./store/useChatStore";
// import { useNotificationStore } from "./store/useNotificationStore";

// const SocketContext = createContext(null);

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const { accessToken, userProfile, setOnlineUsers } = useAuthStore();
//   const { 
//     updateChatWithNotification, 
//     updateChat, 
//     getChats,
//     addNewChat
//   } = useChatStore();
//   const { addNotification, addPendingNotifications, markNotificationAsRead } = useNotificationStore();

//   useEffect(() => {
//     if (accessToken && userProfile) {
//       const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
//         query: { userId: userProfile._id },
//         auth: { token: accessToken },
//       });

//       newSocket.on("connect", () => {
//         console.log("Socket connected");
//         newSocket.emit("user_connected", userProfile._id);
//       });

//       newSocket.on("online_users", (onlineUsers) => {
//         console.log("Online users:", onlineUsers);
//         setOnlineUsers(onlineUsers);
//       });

//       newSocket.on("new_message_notification", (data) => {
//         console.log("Received new_message_notification:", data);
//         if (data && data.chat && data.message) {
//           updateChatWithNotification(data.chat, data.message);
//         } else {
//           console.error("Invalid data received for new_message_notification:", data);
//         }
//       });


//       newSocket.on("pending_notifications", (notifications) => {
//         addPendingNotifications(notifications);
//       });

//       newSocket.on("new_notification", (notification) => {
//         addNotification(notification);
//       });

//       newSocket.on("notification_read", (notificationId) => {
//         markNotificationAsRead(notificationId);
//       });

//       newSocket.on("group_update", ({ chatId, updatedChat, action, userId, userName }) => {
//         updateChat(updatedChat);
//         addNotification({
//           type: "group_update",
//           chat: chatId,
//           content: `${action}: ${userName} ${action === "rename" ? "renamed the group" : action === "add_user" ? "was added" : "was removed"}`,
//         });
//       });

//       newSocket.on("join_group", (chatId) => {
//         console.log("Joined new group:", chatId);
//         getChats();
//       });

//       newSocket.on("leave_group", (chatId) => {
//         console.log("Removed from group:", chatId);
//         getChats();
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [accessToken, userProfile, updateChatWithNotification, updateChat, setOnlineUsers, getChats, addNewChat, addNotification, addPendingNotifications, markNotificationAsRead]);

//   const joinChat = useCallback((chatId) => {
//     if (socket) {
//       socket.emit("join chat", chatId);
//       console.log("Joined chat:", chatId);
//     }
//   }, [socket]);

//   const leaveChat = useCallback((chatId) => {
//     if (socket) {
//       socket.emit("leave chat", chatId);
//       console.log("Left chat:", chatId);
//     }
//   }, [socket]);

//   const emitGroupUpdate = useCallback((chatId, updatedChat, action, userId, userName) => {
//     if (socket) {
//       socket.emit("group_update", { chatId, updatedChat, action, userId, userName });
//     }
//   }, [socket]);

//   return (
//     <SocketContext.Provider value={{ socket, joinChat, leaveChat, emitGroupUpdate }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;


import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useNotificationStore } from "./store/useNotificationStore";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { accessToken, userProfile, setOnlineUsers } = useAuthStore();
  const { 
    updateChatWithNotification, 
    addGroupNotification, 
    updateChat, 
    setSocket: setChatStoreSocket,
    getChats,
    addNewChat
  } = useChatStore();
  const { addNotification, markNotificationAsRead , fetchNotifications} = useNotificationStore();
  useEffect(() => {
    if (accessToken && userProfile) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        query: { userId: userProfile._id },
        auth: { token: accessToken },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        newSocket.emit("user_connected", userProfile._id);
      });

      newSocket.on("online_users", (onlineUsers) => {
        console.log("Online users:", onlineUsers);
        setOnlineUsers(onlineUsers);
      });

      newSocket.on("pending_notifications", (notifications) => {
        notifications.forEach(notification => addNotification(notification));
      });

      newSocket.on("new_notification", (notification) => {
        addNotification(notification);
      });

      newSocket.on("notification_read", (notificationId) => {
        markNotificationAsRead(notificationId);
      });

      newSocket.on("new_message_notification", (data) => {
        console.log("Received new_message_notification:", data);
        if (data && data.chat && data.message) {
          updateChatWithNotification(data.chat, data.message);
        } else {
          console.error("Invalid data received for new_message_notification:", data);
        }
      });

      newSocket.on("group_update", ({ chatId, updatedChat, action, userId, userName }) => {
        console.log("Received group update:", { chatId, updatedChat, action, userId, userName });
        
        let notificationContent = "";
        switch (action) {
          case "rename":
            notificationContent = `Group "${updatedChat.chatName}" has been renamed`;
            break;
          case "add_user":
            notificationContent = `${userName} has been added to the group`;
            break;
          case "remove_user":
            notificationContent = `${userName} has been removed from the group ${updatedChat.chatName}`;
            break;
          case "leave_group":
            notificationContent = `${userName} has left the group`;
            break;
          case "create_group":
            notificationContent = `You have been added to the group "${updatedChat.chatName}"`;
            addNewChat(updatedChat);
            break;
          default:
            notificationContent = "The group has been updated";
        }
        
        updateChat(updatedChat);
        addGroupNotification({
          chatId,
          content: notificationContent,
          timestamp: new Date().toISOString(),
        });
      });


      newSocket.on("new_group_created", (updateChat) => {
        console.log("new group created:", updateChat);
        addNewChat(updateChat);
        // getChats();
      });

      newSocket.on("join_group", (chatId) => {
        console.log("Joined new group:", chatId);
        getChats();
      });

      newSocket.on("leave_group", (chatId) => {
        console.log("Removed from group:", chatId);
        getChats();
      });

      setSocket(newSocket);
      setChatStoreSocket(newSocket);
      fetchNotifications();
      return () => {
        newSocket.disconnect();
      };
    }
  }, [accessToken, userProfile, updateChatWithNotification, addGroupNotification, updateChat, setOnlineUsers, getChats, addNewChat,  addNotification, markNotificationAsRead , fetchNotifications]);

  const joinChat = useCallback((chatId) => {
    if (socket) {
      socket.emit("join chat", chatId);
      console.log("Joined chat:", chatId);
    }
  }, [socket]);

  const leaveChat = useCallback((chatId) => {
    if (socket) {
      socket.emit("leave chat", chatId);
      console.log("Left chat:", chatId);
    }
  }, [socket]);

  const emitGroupUpdate = useCallback((chatId, updatedChat, action, userId, userName) => {
    if (socket) {
      socket.emit("group_update", { chatId, updatedChat, action, userId, userName });
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, joinChat, leaveChat, emitGroupUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;



