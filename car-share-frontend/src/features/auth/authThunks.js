import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';

// Create async thunks for API calls
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const refreshToken = getState().auth.refreshToken;
      const response = await axiosInstance.post('/auth/refresh-token', { refreshToken: refreshToken });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request password reset');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  'auth/requestEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/send-email-otp');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request email verification');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationCode, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/verify-email-otp', { otp: verificationCode });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const sendEmailOTP = createAsyncThunk(
  'auth/sendEmailOTP',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/send-email-otp');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send email OTP');
    }
  }
);

export const requestPhoneVerification = createAsyncThunk(
  'auth/requestPhoneVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/send-phone-otp');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request phone verification');
    }
  }
);

export const verifyPhone = createAsyncThunk(
  'auth/verifyPhone',
  async (verificationCode, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/verify-phone-otp', { otp: verificationCode });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Phone verification failed');
    }
  }
);

export const sendPhoneOTP = createAsyncThunk(
  'auth/sendPhoneOTP',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/send-phone-otp');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send phone OTP');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user data');
    }
  }
); 