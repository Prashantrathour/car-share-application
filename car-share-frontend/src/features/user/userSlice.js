import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  updateUserPreferences,
  fetchUserNotifications,
  markNotificationAsRead,
  deleteUserAccount
} from './userThunks';

const initialState = {
  profile: null,
  notifications: [],
  preferences: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    clearUserData: (state) => {
      state.profile = null;
      state.notifications = [];
      state.preferences = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // Handle direct profile response or nested data structure
        state.profile = payload.data?.profile || payload;
        state.preferences = payload.data?.preferences || payload.preferences || null;
      })
      .addCase(fetchUserProfile.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // Handle direct profile response or nested data structure
        state.profile = payload.data?.profile || payload;
      })
      .addCase(updateUserProfile.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle uploadProfilePicture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.avatar = payload.data?.profilePicture || payload.profilePicture || payload.avatar;
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle updateUserPreferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.preferences = payload.data?.preferences || payload.preferences;
      })
      .addCase(updateUserPreferences.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle fetchUserNotifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.notifications = payload.data?.notifications || payload.notifications || [];
      })
      .addCase(fetchUserNotifications.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, { payload }) => {
        const notificationId = payload.data?.notificationId || payload.notificationId;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
        }
      })
      
      // Handle deleteUserAccount
      .addCase(deleteUserAccount.fulfilled, (state) => {
        // Reset the entire state
        return initialState;
      });
  },
});

// Actions
export const { clearError, updateProfile, clearUserData } = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserNotifications = (state) => state.user.notifications;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;
export const selectUnreadNotificationsCount = (state) => 
  state.user.notifications.filter(n => !n.isRead).length;

export default userSlice.reducer; 