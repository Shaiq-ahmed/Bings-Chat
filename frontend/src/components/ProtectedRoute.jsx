import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ProtectedRoute = () => {
  const { accessToken, userProfile, profile, isCheckingAuth } = useAuthStore();
  console.log(isCheckingAuth);
  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          if (!userProfile) {
            await profile();
          }

          if (!userProfile) {
            toast.error('Session expired. Please log in again.');
            return <Navigate to="/login" />;
          }
        } catch (error) {
          toast.error('Session expired. Please log in again.');
          return <Navigate to="/login" />;
        }
      } else {
        toast.error('Session expired. Please log in again.');
        return <Navigate to="/login" />;
      }
      useAuthStore.setState({ isCheckingAuth: false });
    };

    checkAuth();
  }, [accessToken, userProfile, profile]);

  if (isCheckingAuth && accessToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return accessToken && userProfile ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;