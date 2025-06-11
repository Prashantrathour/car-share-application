import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  selectUserProfile,
  selectUserNotifications,
  selectUserPreferences,
  selectUserLoading,
  selectUserError,
  selectUnreadNotificationsCount,
  fetchUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  updateUserPreferences,
  fetchUserNotifications,
  markNotificationAsRead,
  deleteUserAccount
} from '../features/user';

export const useUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user state from Redux
  const profile = useSelector(selectUserProfile);
  const notifications = useSelector(selectUserNotifications);
  const preferences = useSelector(selectUserPreferences);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const unreadNotificationsCount = useSelector(selectUnreadNotificationsCount);
  
  /**
   * Fetch user profile
   */
  const getUserProfile = async () => {
    try {
      const resultAction = await dispatch(fetchUserProfile());
      
      if (fetchUserProfile.fulfilled.match(resultAction)) {
        // Update user in localStorage if needed
        const userData = resultAction.payload.data?.profile || resultAction.payload;
        if (userData) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({...storedUser, ...userData}));
        }
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to fetch profile');
        return null;
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
      return null;
    }
  };
  
  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      const resultAction = await dispatch(updateUserProfile(profileData));
      
      if (updateUserProfile.fulfilled.match(resultAction)) {
        toast.success('Profile updated successfully');
        // Update user in localStorage
        const userData = resultAction.payload.data?.profile || resultAction.payload;
        if (userData) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({...storedUser, ...userData}));
        }
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to update profile');
        return null;
      }
    } catch (error) {
      toast.error('Failed to update profile');
      return null;
    }
  };
  
  /**
   * Upload profile picture
   */
  const uploadPicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const resultAction = await dispatch(uploadProfilePicture(formData));
      
      if (uploadProfilePicture.fulfilled.match(resultAction)) {
        toast.success('Profile picture updated successfully');
        // Update avatar in localStorage
        const avatarUrl = resultAction.payload.data?.profilePicture || 
                          resultAction.payload.profilePicture || 
                          resultAction.payload.avatar;
        if (avatarUrl) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.avatar = avatarUrl;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to upload profile picture');
        return null;
      }
    } catch (error) {
      toast.error('Failed to upload profile picture');
      return null;
    }
  };
  
  /**
   * Update user preferences
   */
  const updatePreferences = async (preferencesData) => {
    try {
      const resultAction = await dispatch(updateUserPreferences(preferencesData));
      
      if (updateUserPreferences.fulfilled.match(resultAction)) {
        toast.success('Preferences updated successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to update preferences');
        return null;
      }
    } catch (error) {
      toast.error('Failed to update preferences');
      return null;
    }
  };
  
  /**
   * Fetch user notifications
   */
  const getNotifications = async () => {
    try {
      const resultAction = await dispatch(fetchUserNotifications());
      
      if (fetchUserNotifications.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to fetch notifications');
        return null;
      }
    } catch (error) {
      toast.error('Failed to fetch notifications');
      return null;
    }
  };
  
  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      const resultAction = await dispatch(markNotificationAsRead(notificationId));
      
      if (markNotificationAsRead.fulfilled.match(resultAction)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Delete user account
   */
  const deleteAccount = async () => {
    try {
      const resultAction = await dispatch(deleteUserAccount());
      
      if (deleteUserAccount.fulfilled.match(resultAction)) {
        toast.success('Account deleted successfully');
        navigate('/login');
        return true;
      } else {
        toast.error(resultAction.payload || 'Failed to delete account');
        return false;
      }
    } catch (error) {
      toast.error('Failed to delete account');
      return false;
    }
  };
  
  return {
    // State
    profile,
    notifications,
    preferences,
    loading,
    error,
    unreadNotificationsCount,
    
    // Actions
    getUserProfile,
    updateProfile,
    uploadPicture,
    updatePreferences,
    getNotifications,
    markAsRead,
    deleteAccount
  };
};

export default useUser; 