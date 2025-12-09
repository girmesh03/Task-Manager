import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  setUser,
  clearUser,
} from '../redux/features/auth/authSlice.js';
import {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../services/authApi.js';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  const [loginMutation, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [forgotPasswordMutation, { isLoading: isForgotPasswordLoading, error: forgotPasswordError }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetPasswordLoading, error: resetPasswordError }] = useResetPasswordMutation();

  // Role checks
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isManager = user?.role === 'Manager';
  const isUser = user?.role === 'User';

  // Login function
  const login = async (credentials) => {
    const result = await loginMutation(credentials);
    if (result.data?.success) {
      dispatch(setUser(result.data.data.user));
      navigate('/dashboard', { replace: true });
    }
    return result;
  };

  // Logout function
  const logout = async () => {
    await logoutMutation();
    dispatch(clearUser());
    navigate('/login', { replace: true });
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    return await forgotPasswordMutation(email);
  };

  // Reset password function
  const resetPassword = async (data) => {
    return await resetPasswordMutation(data);
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isLoginLoading || isLogoutLoading,
    error: loginError || forgotPasswordError || resetPasswordError,
    isAdmin,
    isSuperAdmin,
    isManager,
    isUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
  };
};

export { useAuth };
export default useAuth;
