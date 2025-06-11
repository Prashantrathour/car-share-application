import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';

export const createPaymentIntent = createAsyncThunk(
  'payments/createPaymentIntent',
  async ({ bookingId, amount, currency = 'usd' }, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create dummy payment intent
      const dummyResponse = {
        id: `pi_${Date.now()}`,
        amount,
        currency,
        bookingId,
        status: 'pending',
        created: new Date().toISOString(),
        clientSecret: `seti_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`
      };

      return dummyResponse;
    } catch (error) {
      return rejectWithValue('Failed to create payment intent');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payments/confirmPayment',
  async ({ paymentIntentId, bookingId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/confirm', {
        paymentIntentId,
        bookingId
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchPaymentHistory',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await axiosInstance.get(`/payments/history?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

export const fetchPaymentDetails = createAsyncThunk(
  'payments/fetchPaymentDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment details');
    }
  }
);

export const refundPayment = createAsyncThunk(
  'payments/refundPayment',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/payments/${paymentId}/refund`, { reason });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refund payment');
    }
  }
); 