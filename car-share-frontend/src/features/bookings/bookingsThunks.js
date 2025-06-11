import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';
import { setSelectedBooking, setError, clearBookingForm } from './bookingsSlice';

// Simulate payment processing
const processSimulatedPayment = async (amount) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate 90% success rate
  return Math.random() > 0.1;
};

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const processPayment = createAsyncThunk(
  'bookings/processPayment',
  async ({ bookingId, amount }, { rejectWithValue }) => {
    try {
      // Simulate payment processing
      const success = await processSimulatedPayment(amount);
      
      if (!success) {
        throw new Error('Payment processing failed');
      }

      // Update booking payment status in backend
      const response = await axiosInstance.patch(`/bookings/${bookingId}/payment`, {
        status: 'paid',
        amount,
        paymentMethod: 'simulated'
      });

      return {
        bookingId,
        ...response.data
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Payment processing failed');
    }
  }
);

export const fetchBooking = createAsyncThunk(
  'bookings/fetchBooking',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/bookings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchSingleBooking = createAsyncThunk(
  'bookings/fetchSingleBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  
  async ({ id, bookingData }, { rejectWithValue }) => {
    console.log({bookingData})
    try {
      const response = await axiosInstance.patch(`/bookings/${id}`, bookingData);
      console.log({response})
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ id, cancellationReason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/bookings/${id}/cancel`, { cancellationReason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const rateBooking = createAsyncThunk(
  'bookings/rateBooking',
  async ({ id, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/bookings/${id}/rate`, { rating, comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate booking');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'bookings/confirmBooking',
  async ({ id, action, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/bookings/${id}/confirm`, { action, reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm/reject booking');
    }
  }
); 
export const completeBooking = createAsyncThunk(
  'bookings/completeBooking',
  async ({ id, action, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/bookings/${id}/complete`, { action, reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete/reject booking');
    }
  }
); 