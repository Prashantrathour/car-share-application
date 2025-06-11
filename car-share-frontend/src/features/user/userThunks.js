import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/users/profile', profileData);
      console.log(response)
      return response.data;
    } catch (error) {
      console.log(error)
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Invalid request data';
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload profile picture');
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user preferences');
    }
  }
);

export const fetchUserNotifications = createAsyncThunk(
  'user/fetchUserNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'user/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  'user/deleteUserAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/users/account');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account');
    }
  }
); 