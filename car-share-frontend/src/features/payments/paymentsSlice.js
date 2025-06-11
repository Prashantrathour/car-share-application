import { createSlice } from '@reduxjs/toolkit';
import { createPaymentIntent, confirmPayment, fetchPaymentHistory, fetchPaymentDetails, refundPayment } from './paymentsThunks';

const initialState = {
  currentPayment: null,
  paymentHistory: [],
  paymentIntent: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle createPaymentIntent
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.paymentIntent = payload;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle confirmPayment
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.currentPayment = payload.payment;
        state.paymentIntent = null;
        state.error = null;
      })
      .addCase(confirmPayment.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle fetchPaymentHistory
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.paymentHistory = payload.payments;
        state.pagination = payload.pagination;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle fetchPaymentDetails
      .addCase(fetchPaymentDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.currentPayment = payload.payment;
        state.error = null;
      })
      .addCase(fetchPaymentDetails.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle refundPayment
      .addCase(refundPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refundPayment.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.currentPayment = payload.payment;
        state.error = null;
      })
      .addCase(refundPayment.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  }
});

// Actions
export const {
  clearPaymentIntent,
  setError
} = paymentsSlice.actions;

// Selectors
export const selectCurrentPayment = (state) => state.payments.currentPayment;
export const selectPaymentHistory = (state) => state.payments.paymentHistory;
export const selectPaymentIntent = (state) => state.payments.paymentIntent;
export const selectPaymentError = (state) => state.payments.error;
export const selectPaymentPagination = (state) => state.payments.pagination;

export default paymentsSlice.reducer; 