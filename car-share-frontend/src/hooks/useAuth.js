import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectAuthError, 
  selectVerificationStatus,
  selectIsVerified,
  selectIsActive,
  selectUserRole,
  selectAuthLoading,
  clearError,
  login as loginAction,
  register as registerAction,
  logoutUser,
  verifyEmail as verifyEmailAction,
  requestEmailVerification,
  requestPhoneVerification,
  requestPasswordReset,
  resetPassword as resetPasswordAction
} from '../features/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth state from Redux
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isActive = useSelector(selectIsActive);
  const userRole = useSelector(selectUserRole);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  /**
   * Login with email and password
   */
  const login = async (credentials) => {
    try {
      const resultAction = await dispatch(loginAction(credentials));
      
      if (loginAction.fulfilled.match(resultAction)) {
        // Get redirect path from location state or default to trips
        const from = location.state?.from?.pathname || '/trips';
        
        // Check if verification is needed
        const user = resultAction.payload.user;
        if (user && (!user.isEmailVerified || !user.isPhoneVerified)) {
          navigate('/verification-status');
        } else {
          navigate(from);
        }
        
        toast.success('Login successful');
        return true;
      } else {
        toast.error(resultAction.payload || 'Login failed');
        return false;
      }
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };
  
  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      const resultAction = await dispatch(registerAction(userData));
      
      if (registerAction.fulfilled.match(resultAction)) {
        toast.success('Registration successful');
        navigate('/verification-status');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Registration failed');
        throw new Error(resultAction.payload || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };
  
  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());
      
      if (logoutUser.fulfilled.match(resultAction)) {
        toast.success('Logged out successfully');
      }
      
      navigate('/login');
      return true;
    } catch (error) {
      // Still navigate to login even if the API call fails
      navigate('/login');
      return false;
    }
  };
  
  /**
   * Verify user email with OTP
   */
  const verifyEmail = async (verificationCode) => {
    try {
      const resultAction = await dispatch(verifyEmailAction(verificationCode));
      
      if (verifyEmailAction.fulfilled.match(resultAction)) {
        toast.success('Email verified successfully');
        return true;
      } else {
        toast.error(resultAction.payload || 'Email verification failed');
        return false;
      }
    } catch (error) {
      toast.error('Email verification failed');
      return false;
    }
  };
  
  /**
   * Send OTP to user's email
   */
  const sendEmailOTP = async () => {
    try {
      const resultAction = await dispatch(requestEmailVerification());
      
      if (requestEmailVerification.fulfilled.match(resultAction)) {
        toast.success('OTP sent to your email');
        return true;
      } else {
        toast.error(resultAction.payload || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      toast.error('Failed to send OTP');
      return false;
    }
  };
  
  /**
   * Send OTP to user's phone
   */
  const sendPhoneOTP = async () => {
    try {
      const resultAction = await dispatch(requestPhoneVerification());
      
      if (requestPhoneVerification.fulfilled.match(resultAction)) {
        toast.success('OTP sent to your phone');
        return true;
      } else {
        toast.error(resultAction.payload || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      toast.error('Failed to send OTP');
      return false;
    }
  };
  
  /**
   * Request password reset
   */
  const forgotPassword = async (email) => {
    try {
      const resultAction = await dispatch(requestPasswordReset(email));
      
      if (requestPasswordReset.fulfilled.match(resultAction)) {
        toast.success('Password reset instructions sent to your email');
        return true;
      } else {
        toast.error(resultAction.payload || 'Failed to process request');
        return false;
      }
    } catch (error) {
      toast.error('Failed to process request');
      return false;
    }
  };
  
  /**
   * Reset password with token
   */
  const resetPassword = async (data) => {
    try {
      const resultAction = await dispatch(resetPasswordAction(data));
      
      if (resetPasswordAction.fulfilled.match(resultAction)) {
        toast.success('Password reset successful');
        navigate('/login');
        return true;
      } else {
        toast.error(resultAction.payload || 'Failed to reset password');
        return false;
      }
    } catch (error) {
      toast.error('Failed to reset password');
      return false;
    }
  };
  
  /**
   * Clear authentication errors
   */
  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isActive,
    userRole,
    loading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    sendEmailOTP,
    sendPhoneOTP,
    forgotPassword,
    resetPassword,
    clearAuthError
  };
};

export default useAuth; 