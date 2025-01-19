import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

const ProtectedRoute = () => {
  const { accessToken, userProfile, profile, isCheckingAuth } = useAuthStore();
  console.log(isCheckingAuth);
  useEffect(() => {
    if (accessToken && !userProfile) {
      profile();
      
    }
    else if (!accessToken) {
      // If there's no access token, we're not authenticated, so we can stop checking
      useAuthStore.setState({ isCheckingAuth: false });
    }
  }, [accessToken, userProfile, profile]);

  if (isCheckingAuth && accessToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;