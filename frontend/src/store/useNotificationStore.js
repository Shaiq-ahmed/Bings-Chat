import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/notifications");
      set({ notifications: response.data, isLoading: false, error: null });
    } catch (error) {
      set({ error: "Failed to fetch notifications", isLoading: false });
    }
  },

  addNotification: (notification) =>
    set((state) => {
      // Check if the notification already exists in the list
      const notificationExists = state.notifications.some(
        (n) => n._id === notification._id
      );

      // If it doesn't exist, add it to the front of the list; otherwise, keep the state the same
      return {
        notifications: notificationExists
          ? state.notifications // Keep the state unchanged
          : [notification, ...state.notifications], // Add the new notification
      };
    }),

  markNotificationAsRead: async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  clearNotifications: async () => {
    try {
      await axiosInstance.delete("/notifications");
      set({ notifications: [] });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },
}));
