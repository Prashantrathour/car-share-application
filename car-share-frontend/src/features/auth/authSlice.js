import { createSlice } from '@reduxjs/toolkit';
import {
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

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  error: null,
  loading: false,
  verificationStatus: {
    isEmailVerified: false,
    isPhoneVerified: false,
    isComplete: false,
    status: 'pending'
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload: { user, tokens } }) => {
    
      state.user = user;
      state.accessToken = tokens.access?.token || tokens.accessToken;
      state.refreshToken = tokens.refresh?.token || tokens.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      
      // Update verification status
      state.verificationStatus = {
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isComplete: user.isEmailVerified && user.isPhoneVerified,
        status: user.status
      };

      // Store tokens and user in localStorage
      localStorage.setItem('accessToken', tokens.access?.token || tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refresh?.token || tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    refreshTokens: (state, { payload: { tokens } }) => {
      state.accessToken = tokens.access?.token || tokens.accessToken;
      state.refreshToken = tokens.refresh?.token || tokens.refreshToken;
      
      // Update localStorage
      localStorage.setItem('accessToken', tokens.access?.token || tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refresh?.token || tokens.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.verificationStatus = {
        isEmailVerified: false,
        isPhoneVerified: false,
        isComplete: false,
        status: 'pending'
      };

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.verificationStatus = {
        isEmailVerified: false,
        isPhoneVerified: false,
        isComplete: false,
        status: 'pending'
      };

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authFailed: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    updateVerificationStatus: (state, { payload }) => {
      state.verificationStatus = {
        ...state.verificationStatus,
        ...payload,
        isComplete: payload.isEmailVerified && payload.isPhoneVerified
      };

      if (state.user) {
        state.user = {
          ...state.user,
          isEmailVerified: payload.isEmailVerified || state.user.isEmailVerified,
          isPhoneVerified: payload.isPhoneVerified || state.user.isPhoneVerified,
          status: payload.status || state.user.status
        };
        
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.accessToken = payload.tokens.access.token;
        state.refreshToken = payload.tokens.refresh.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        
        state.verificationStatus = {
          isEmailVerified: payload.user.isEmailVerified,
          isPhoneVerified: payload.user.isPhoneVerified,
          isComplete: payload.user.isEmailVerified && payload.user.isPhoneVerified,
          status: payload.user.status
        };
        
        // Store tokens and user in localStorage
        localStorage.setItem('accessToken', payload.tokens.access.token);
        localStorage.setItem('refreshToken', payload.tokens.refresh.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.accessToken = payload.tokens.access.token;
        state.refreshToken = payload.tokens.refresh.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        
        state.verificationStatus = {
          isEmailVerified: payload.user.isEmailVerified,
          isPhoneVerified: payload.user.isPhoneVerified,
          isComplete: payload.user.isEmailVerified && payload.user.isPhoneVerified,
          status: payload.user.status
        };
        
        // Store tokens and user in localStorage
        localStorage.setItem('accessToken', payload.tokens.access.token);
        localStorage.setItem('refreshToken', payload.tokens.refresh.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Handle logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.verificationStatus = {
          isEmailVerified: false,
          isPhoneVerified: false,
          isComplete: false,
          status: 'pending'
        };
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if the API call fails, we still want to log out the user locally
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.verificationStatus = {
          isEmailVerified: false,
          isPhoneVerified: false,
          isComplete: false,
          status: 'pending'
        };
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      // Handle refresh token
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.accessToken = payload.tokens.access.token;
        state.refreshToken = payload.tokens.refresh.token;
        
        // Update localStorage
        localStorage.setItem('accessToken', payload.tokens.access.token);
        localStorage.setItem('refreshToken', payload.tokens.refresh.token);
      })
      // Handle getCurrentUser
      .addCase(getCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.verificationStatus = {
          isEmailVerified: payload.user.isEmailVerified,
          isPhoneVerified: payload.user.isPhoneVerified,
          isComplete: payload.user.isEmailVerified && payload.user.isPhoneVerified,
          status: payload.user.status
        };
        
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      // Handle verifyEmail
      .addCase(verifyEmail.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.verificationStatus = {
          ...state.verificationStatus,
          isEmailVerified: payload.user.isEmailVerified,
          isComplete: payload.user.isEmailVerified && state.verificationStatus.isPhoneVerified
        };
        
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      // Handle verifyPhone
      .addCase(verifyPhone.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.verificationStatus = {
          ...state.verificationStatus,
          isPhoneVerified: payload.user.isPhoneVerified,
          isComplete: state.verificationStatus.isEmailVerified && payload.user.isPhoneVerified
        };
        
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(payload.user));
      });
  },
});

// Actions
export const {
  setCredentials,
  refreshTokens,
  logout,
  clearCredentials,
  setError,
  clearError,
  authStart,
  authFailed,
  updateVerificationStatus
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectVerificationStatus = (state) => state.auth.verificationStatus;
export const selectIsVerified = (state) => state.auth.verificationStatus?.isComplete || false;
export const selectIsActive = (state) => state.auth.user?.status === 'active' || false;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthLoading = (state) => state.auth.loading || false;

export default authSlice.reducer; 