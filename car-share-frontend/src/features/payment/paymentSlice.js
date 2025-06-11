import { createSlice } from '@reduxjs/toolkit';
import {
  addNewPaymentMethod,
  getPaymentMethods,processPayment,removePaymentMethod,
  initiateRefund,
  withdrawToBank
} from './paymentThunks';

const initialState = {
  paymentIntent: null,
  paymentMethods: [],
  transactions: [],
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPaymentIntent: (state, { payload }) => {
      state.paymentIntent = payload;
    },
    clearPaymentData: (state) => {
      return initialState;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle addNewPaymentMethod
      .addCase(addNewPaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewPaymentMethod.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.paymentMethods.push(payload.data.paymentMethod);
      })
      .addCase(addNewPaymentMethod.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle processPayment
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.paymentIntent = payload.data.paymentIntent;
        state.transactions.push(payload.data.transaction);
      })
      .addCase(processPayment.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle initiateRefund
      .addCase(initiateRefund.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateRefund.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.transactions.push(payload.data.refundTransaction);
      })
      .addCase(initiateRefund.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      
      // Handle withdrawToBank
      .addCase(withdrawToBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawToBank.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.transactions.push(payload.data.withdrawalTransaction);
      })
      .addCase(withdrawToBank.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

// Actions
export const { clearError, setPaymentIntent, clearPaymentData, setError } = paymentSlice.actions;

// Selectors
export const selectPaymentIntent = (state) => state.payment.paymentIntent;
export const selectPaymentMethods = (state) => state.payment.paymentMethods;
export const selectTransactions = (state) => state.payment.transactions;
export const selectPaymentLoading = (state) => state.payment.isLoading;
export const selectPaymentError = (state) => state.payment.error;

export default paymentSlice.reducer; 