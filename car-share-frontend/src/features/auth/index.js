// Re-export everything from authSlice
export {
  default as authReducer,
  setCredentials,
  refreshTokens,
  logout,
  clearCredentials,
  setError,
  clearError,
  authStart,
  authFailed,
  updateVerificationStatus,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthError,
  selectVerificationStatus,
  selectIsVerified,
  selectIsActive,
  selectUserRole,
  selectAuthLoading
} from './authSlice';

// Re-export everything from authThunks
export {
  login,
  register,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  requestPhoneVerification,
  verifyPhone,
  getCurrentUser
} from './authThunks'; 