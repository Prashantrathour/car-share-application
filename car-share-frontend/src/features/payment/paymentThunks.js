import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosService';
import { setError } from './paymentSlice';

export const addNewPaymentMethod = createAsyncThunk(
  'payment/addPaymentMethod',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/methods', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment method');
    }
  }
);

export const getPaymentMethods = createAsyncThunk(
  'payment/getPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/methods');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get payment methods');
    }
  }
);

export const removePaymentMethod = createAsyncThunk(
  'payment/removePaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/payments/methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove payment method');
    }
  }
);

export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment');
    }
  }
);

export const initiateRefund = createAsyncThunk(
  'payment/requestRefund',
  async ({ transactionId, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/refunds', { transactionId, reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request refund');
    }
  }
);

export const withdrawToBank = createAsyncThunk(
  'payment/withdrawFunds',
  async (withdrawData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/withdraw', withdrawData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw funds');
    }
  }
); 