import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requireAdmin: boolean = false
) => {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page with return URL
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !user?.isAdmin) {
      // Redirect to home if admin access is required but user is not admin
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};
