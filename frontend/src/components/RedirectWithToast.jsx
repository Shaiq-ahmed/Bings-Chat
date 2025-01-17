// RedirectWithToast.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RedirectWithToast = ({ path, message }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show the toast message
    toast.error(message);

    // Redirect after a short delay (optional)
    const timer = setTimeout(() => {
      navigate(path);
    }, 2000); // Redirects after 2 seconds

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [navigate, path, message]);

  return null; // This component doesn't render anything
};

export default RedirectWithToast;