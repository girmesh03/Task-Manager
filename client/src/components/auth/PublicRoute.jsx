import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
// import { LoadingFallback } from "../common/MuiLoading.jsx";

/**
 * PublicRoute - Wrapper component for public routes (login, register, etc.)
 * Redirects to /dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    // Show loading state while checking authentication
    return null; // Or a loading spinner component
    //  return <LoadingFallback message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if not authenticated
  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicRoute;
