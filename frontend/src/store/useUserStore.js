import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';


export const useUserStore = create((set) => ({
  searchResults: [],
  groupSearchResults: [],
  isSearching: false,
  isSearchInGroup: false,
  isChangingPassword: false,

  searchUsers: async (searchTerm) => {
    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/user/search?search=${searchTerm}`);
      set({ searchResults: res.data.users, isSearching: false });
    } catch (error) {
      console.error("Error searching users:", error);
      set({ isSearching: false });
    }
  },
  searchUsersForGroup: async (searchTerm) => {
    set({ isSearchInGroup: true });
    try {
      const res = await axiosInstance.get(`/user/search?search=${searchTerm}`);
      set({ groupSearchResults: res.data.users, isSearchInGroup: false });
    } catch (error) {
      console.error("Error searching users for group:", error);
      set({ isSearchInGroup: false });
    }
  },
  clearSearchResults: () => set({ searchResults: [] }),
  clearGroupSearchResults: () => set({ groupSearchResults: [] }),

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    set({ isChangingPassword: true });
    try {
      const response = await axiosInstance.patch('/user/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      set({ isChangingPassword: false });
      toast.success('Password changed successfully', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return response.data;
    } catch (error) {
      set({ isChangingPassword: false });
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`${error.response.data.error}`, {
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        throw new Error(error.response.data.error);
      } else {
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  },

  logout: async () => {
    try {
      await axiosInstance.delete('/auth/logout');
      set({ user: null });
      localStorage.removeItem('access-token');
      toast.success('Logged out successfully', {
        icon: '👋',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      window.location.href = '/login';
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error('Failed to log out', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  },

}));

