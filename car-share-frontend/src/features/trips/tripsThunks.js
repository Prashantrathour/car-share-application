import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';
import { setSelectedTrip, setError } from './tripsSlice';

// Basic API thunks
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/trips', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trips');
    }
  }
);

export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trip');
    }
  }
);

// RTK Query wrapper thunks
export const fetchTrip = createAsyncThunk(
  'trips/fetchTrip',
  async (tripId, { dispatch }) => {
    try {
      // Use the fetchTripById thunk instead of tripsApi
      const resultAction = await dispatch(fetchTripById(tripId));
      if (fetchTripById.fulfilled.match(resultAction)) {
        dispatch(setSelectedTrip(resultAction.payload));
        return resultAction.payload;
      } else {
        dispatch(setError(resultAction.payload || 'Failed to fetch trip'));
        throw new Error(resultAction.payload || 'Failed to fetch trip');
      }
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const createNewTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/trips', tripData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create trip');
    }
  }
);

export const updateExistingTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ id, ...tripData }, { dispatch }) => {
    try {
      const response = await axiosInstance.patch(`/trips/${id}`, tripData);
      dispatch(setSelectedTrip(response.data));
      return response.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to update trip'));
      throw error;
    }
  }
);

export const deleteExistingTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId, { dispatch }) => {
    try {
      await axiosInstance.delete(`/trips/${tripId}`);
      dispatch(setSelectedTrip(null));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to delete trip'));
      throw error;
    }
  }
); 