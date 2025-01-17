import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { SocketProvider } from "../SocketProvider";
import { CallProvider } from "../components/CallProvider";
import CallInterface from '../components/CallInterface';

const RootLayout = () => {
  const { accessToken, profile } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (accessToken) {
      profile();
    }
  }, [accessToken, profile]);

  return (
    <SocketProvider>
      <CallProvider>
        <div data-theme={theme}>
          <Navbar />
          <Outlet />
          <Toaster />
          <CallInterface />
        </div>
      </CallProvider>
    </SocketProvider>
  );
};

export default RootLayout;

