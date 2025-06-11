import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';
import { setError } from './driverSlice';

export const updateDriverProfile = createAsyncThunk(
  'driver/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update driver profile');
    }
  }
);

/**
 * Fetch driver details
 */
export const fetchDriverDetails = createAsyncThunk(
  'driver/fetchDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/driver/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver details');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'driver/uploadDocument',
  async ({ type, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('file', file);
      
      const response = await axiosInstance.post('/users/driver/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'driver/updateAvailability',
  async (status, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/users/driver/availability', { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update availability');
    }
  }
);

export const becomeDriver = createAsyncThunk(
  'driver/becomeDriver',
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/driver', driverData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to become a driver');
    }
  }
); 