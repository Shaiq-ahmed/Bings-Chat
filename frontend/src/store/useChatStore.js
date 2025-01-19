import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import RedirectWithToast from "../components/RedirectWithToast";

export const useChatStore = create((set, get) => ({
  messages: [],
  chats: [],
  selectedChat: null,
  isMessagesLoading: false,
  isChatsLoading: false,
  hasMoreMessages: true,
  loading: false,
  unreadMessages: {},
  groupNotifications: {},
  socket: null,
  error: null,

  setSocket: (socket) => set({ socket }),

  updateChatWithNotification: async (chat, message) => {
    set((state) => {
      const isChatSelected = state.selectedChat?._id === chat._id;
      const updatedChats = state.chats.map((c) =>
        c._id === chat._id
          ? {
              ...c,
              latestMessage: message,
              unreadCount: isChatSelected ? 0 : (c.unreadCount || 0) + 1,
            }
          : c
      );

      updatedChats.sort((a, b) => {
        const dateA = a.latestMessage
          ? new Date(a.latestMessage.createdAt)
          : new Date(0);
        const dateB = b.latestMessage
          ? new Date(b.latestMessage.createdAt)
          : new Date(0);
        return dateB - dateA;
      });

      return {
        chats: updatedChats,
        messages: isChatSelected
          ? [...state.messages, message]
          : state.messages,
      };
    });
  },

  addGroupNotification: ({ chatId, content, timestamp }) => {
    console.log("add group motification", chatId, content, timestamp);
    set((state) => ({
      groupNotifications: {
        ...state.groupNotifications,
        [chatId]: [
          ...(state.groupNotifications[chatId] || []),
          { content, timestamp },
        ],
      },
    }));
    toast.success(content); // Show a toast notification for group updates
  },

  clearGroupNotifications: (chatId) => {
    set((state) => ({
      groupNotifications: {
        ...state.groupNotifications,
        [chatId]: [],
      },
    }));
  },

  addNewChat: (chat) => {
    set((state) => {
      const chatExists = state.chats.some((c) => c._id === chat._id);
      if (chatExists) {
        return state;
      }
      return {
        chats: [chat, ...state.chats],
      };
    });
  },

  getChats: async () => {
    set({ isChatsLoading: true });
    try {
      const res = await axiosInstance.get("/chat/");
      set({ chats: res.data.chats });
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to fetch chats");
    } finally {
      set({ isChatsLoading: false });
    }
  },

  selectChat: async (chatId) => {
    const { selectedChat, chats } = get();
    if (selectedChat && selectedChat._id === chatId) return;

    set((state) => {
      const updatedChats = state.chats.map((c) =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      );
      return {
        isMessagesLoading: true,
        selectedChat: null,
        messages: [],
        chats: updatedChats,
      };
    });

    try {
      const [chatDetailsRes, messagesRes] = await Promise.all([
        axiosInstance.get(`/chat/details/${chatId}`),
        axiosInstance.get(`/messages/${chatId}?offset=0&limit=20`),
      ]);
      set((state) => ({
        selectedChat: chatDetailsRes.data.chat,
        messages: messagesRes.data.messages.reverse(),
        hasMoreMessages: messagesRes.data.messages.length === 20,
        unreadMessages: { ...state.unreadMessages, [chatId]: 0 },
        error:null
      }));
      get().clearGroupNotifications(chatId);
    } catch (error) {
      console.error("Error fetching chat details and messages:", error);
      // toast.error("Failed to load chat");
      set({ error: "Failed to load chat" });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  accessChat: async (userId) => {
    try {
      const result = await axiosInstance.post('/chat', { userId });
      await get().selectChat(result.data.chat._id);
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error("Failed to access chat");
    }
  },

  getMoreMessages: async (chatId, offset = 0, limit = 20) => {
    const { isMessagesLoading } = get();
    if (isMessagesLoading) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(
        `/messages/${chatId}?offset=${offset}&limit=${limit}`
      );
      const newMessages = res.data.messages;
      set((state) => ({
        messages: [...newMessages.reverse(), ...state.messages],
        hasMoreMessages: newMessages.length === limit,
      }));
    } catch (error) {
      console.error("Error fetching more messages:", error);
      toast.error("Failed to fetch more messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (chatId, messageData) => {
    try {
      const res = await axiosInstance.post(
        `/messages/send/${chatId}`,
        messageData
      );
      set((state) => ({
        messages: state.messages.some((msg) => msg._id === res.data.message._id)
          ? state.messages
          : [...state.messages, res.data.message],
        chats: state.chats
          .map((chat) =>
            chat._id === chatId
              ? { ...chat, latestMessage: res.data.message }
              : chat
          )
          .sort((a, b) => {
            const dateA = a.latestMessage
              ? new Date(a.latestMessage.createdAt)
              : new Date(0);
            const dateB = b.latestMessage
              ? new Date(b.latestMessage.createdAt)
              : new Date(0);
            return dateB - dateA;
          }),
      }));
      return res.data.message;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      throw error;
    }
  },

  subscribeToMessages: (chatId, socket) => {
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    socket.on("message", (newMessage) => {
      if (newMessage.chat._id === chatId) {
        set((state) => ({
          messages: [...state.messages, newMessage],
          chats: state.chats.map((chat) =>
            chat._id === chatId ? { ...chat, latestMessage: newMessage } : chat
          ), //.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt))
        }));
      }
    });
  },

  unsubscribeFromMessages: (socket) => {
    if (socket) {
      socket.off("message");
    }
  },

  resetUnreadCount: (chatId) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
      ),
    }));
  },

  createGroupChat: async (formData, userProfile) => {
    try {
      set({ loading: true });

      const response = await axiosInstance.post("/chat/group", formData);
      set((state) => ({
        chats: [response.data.chat, ...state.chats],
      }));

      // Emit socket event after successful API call
      const { socket } = get();
      if (socket) {
        socket.emit("group_update", {
          chatId: response.data.chat._id,
          updatedChat: response.data.chat,
          action: "create_group",
          userId: userProfile._id,
          userName: userProfile.name,
        });
      }

      toast.success("Group chat created successfully");
      return response.data.chat;
    } catch (error) {
      console.error("Error creating group chat:", error);
      toast.error("Failed to create group chat");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateGroupImage: async (chatId, formData) => {
    try {
      const response = await axiosInstance.put(`/chat/group/img/${chatId}/upload`, formData);
      // debugger;
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId ? response.data.chat : chat
        ),
        selectedChat:
          state.selectedChat?._id === chatId
            ? {...state.selectedChat, img: response.data.chat.img}
            : state.selectedChat,
      }));
      toast.success("Group image updated successfully");
      return response.data.chat;
    } catch (error) {
      console.error("Error updating group image:", error);
      toast.error("Failed to update group image");
      throw error;
    }
  },

  renameGroup: async (chatId, newName, userProfile) => {
    try {
      const response = await axiosInstance.put(`/chat/group/${chatId}/rename`, {
        chatName: newName,
      });
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId ? { ...chat, chatName: newName } : chat
        ),
        selectedChat:
          state.selectedChat?._id === chatId
            ? { ...state.selectedChat, chatName: newName }
            : state.selectedChat,
      }));

      // Emit socket event after successful API call
      const { socket } = get();
      if (socket) {
        socket.emit("group_update", {
          chatId,
          updatedChat: response.data.chat,
          action: "rename",
          userId: userProfile._id,
          userName: userProfile.name,
        });
      }

      toast.success("Group renamed successfully");
      return response.data.chat;
    } catch (error) {
      console.error("Error renaming group:", error);
      toast.error("Failed to rename group");
      throw error;
    }
  },

  addToGroup: async (chatId, userId, userProfile) => {
    try {
      console.log("Adding user to group:", userProfile);
      const response = await axiosInstance.put(
        `/chat/group/${chatId}/add-user`,
        { userId }
      );
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId ? response.data.chat : chat
        ),
        selectedChat:
          state.selectedChat?._id === chatId
            ? response.data.chat
            : state.selectedChat,
      }));

      // Emit socket event after successful API call
      const { socket } = get();
      if (socket) {
        socket.emit("group_update", {
          chatId,
          updatedChat: response.data.chat,
          action: "add_user",
          userId,
          userName: userProfile.name,
          actionBy: userProfile._id,
        });
      }

      toast.success("User added to group successfully");
      return response.data.chat;
    } catch (error) {
      console.error("Error adding user to group:", error);
      toast.error("Failed to add user to group");
      throw error;
    }
  },

  removeFromGroup: async (chatId, userId, userName, userProfile) => {
    try {
      const response = await axiosInstance.put(
        `/chat/group/${chatId}/remove-user`,
        { userId }
      );
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId ? response.data.chat : chat
        ),
        selectedChat:
          state.selectedChat?._id === chatId
            ? response.data.chat
            : state.selectedChat,
      }));

      // Emit socket event after successful API call
      const { socket } = get();
      if (socket) {
        socket.emit("group_update", {
          chatId,
          updatedChat: response.data.chat,
          action: "remove_user",
          userId,
          userName,
          actionBy: userProfile,
        });
      }

      toast.success("User removed from group successfully");
      return response.data.chat;
    } catch (error) {
      console.error("Error removing user from group:", error);
      toast.error("Failed to remove user from group");
      throw error;
    }
  },

  leaveChat: async (chatId, userId, userName) => {
    try {
      const response = await axiosInstance.put(`/chat/group/${chatId}/leave-chat`);
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== chatId),
        selectedChat:
          state.selectedChat?._id === chatId ? null : state.selectedChat,
      }));

      // Emit socket event after successful API call
      const { socket } = get();
      if (socket) {
        socket.emit("group_update", {
          chatId,
          updatedChat: response.data.chat,
          action: "leave_group",
          userId,
          userName,
        });
      }

      toast.success("You have left the group");
      window.location.href = "/";
      // Navigate('/')
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
      throw error;
    }
  },

  updateChat: (updatedChat) => {
    console.log(updatedChat._id),
    set((state) => ({
      chats: state.chats.map((chat) =>
        
        chat._id === updatedChat._id ? updatedChat : chat
      ),
      selectedChat:
        state.selectedChat?._id === updatedChat._id
          ? updatedChat
          : state.selectedChat,
    }));
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  clearNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n._id !== notificationId
      ),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));
