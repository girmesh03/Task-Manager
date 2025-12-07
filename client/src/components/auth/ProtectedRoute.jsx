import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading } from '../../redux/features/auth/authSlice.js';
import { LoadingFallback } from '../common/MuiLoading.jsx';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
