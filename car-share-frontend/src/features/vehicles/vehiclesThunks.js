import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/vehicles');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
); 