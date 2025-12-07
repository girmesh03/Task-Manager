import React from 'react';
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading } from '../../redux/features/auth/authSlice.js';
import { LoadingFallback } from '../common/MuiLoading.jsx';

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
