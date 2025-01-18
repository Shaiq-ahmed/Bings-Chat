import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import axios from 'axios';
import toast from "react-hot-toast";
import { useSocket } from '../SocketProvider';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const useAuthStore = create((set, get) => ({
  userProfile: null,
  accessToken: localStorage.getItem("access-token") || null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  profile: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/user/profile");
      set({ userProfile: res.data, isCheckingAuth: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("access-token");
        set({ accessToken: null, userProfile: null });
      }
      set({ isCheckingAuth: false });
    }
  },

  // accessToken: localStorage.getItem('access-token'),
  // userProfile: null,
  // isAuthenticated: false,
  // isLoading: true,

  // initializeAuth: async () => {
  //   const token = localStorage.getItem('access-token');
  //   if (token) {
  //     try {
  //       const response = await axiosInstance.get('/user/profile');
  //       set({ 
  //         userProfile: response.data, 
  //         isAuthenticated: true, 
  //         isLoading: false 
  //       });
  //     } catch (error) {
  //       console.error('Failed to fetch user profile:', error);
  //       localStorage.removeItem('access-token');
  //       set({ 
  //         accessToken: null, 
  //         userProfile: null, 
  //         isAuthenticated: false, 
  //         isLoading: false 
  //       });
  //     }
  //   } else {
  //     set({ isLoading: false });
  //   }
  // },


  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, data);
      set({ userProfile: res.data });
      toast.success("Account created successfully, Please Log In");
      window.location.href = "/login";
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.error || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, data, {withCredentials: true});
      localStorage.setItem("access-token", res.data.accessToken);
      set({ accessToken: res.data.accessToken });
      toast.success("Logged in successfully");
      await get().profile();
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ userProfile: null, accessToken: null });
      localStorage.removeItem("access-token");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.error || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/user/change-avatar", data);
      set({ userProfile: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

