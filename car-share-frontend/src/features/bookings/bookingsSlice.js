import { createSlice } from '@reduxjs/toolkit';
import { createBooking, fetchBooking, updateBooking, cancelBooking, rateBooking, confirmBooking, processPayment ,completeBooking,fetchSingleBooking} from './bookingsThunks';

const initialState = {
  selectedBooking: null,
  bookings: [],
  bookingForm: {
    numberOfSeats: 1,
    pickupLocation: null,
    dropoffLocation: null,
    passengerNotes: '',
    baggageCount: 0,
    specialRequests: []
  },
  payment: {
    isProcessing: false,
    error: null,
    success: false
  },
  isLoading: false,
  error: null
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setSelectedBooking: (state, { payload }) => {
      state.selectedBooking = payload;
    },
    updateBookingForm: (state, { payload }) => {
      state.bookingForm = {
        ...state.bookingForm,
        ...payload
      };
    },
    clearBookingForm: (state) => {
      state.bookingForm = initialState.bookingForm;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    resetPaymentState: (state) => {
      state.payment = initialState.payment;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchBooking
      .addCase(fetchBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.bookings = payload || [];
        state.error = null;
      })
      .addCase(fetchBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle createBooking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.selectedBooking = payload;
        state.bookingForm = initialState.bookingForm;
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle processPayment
      .addCase(processPayment.pending, (state) => {
        state.payment.isProcessing = true;
        state.payment.error = null;
        state.payment.success = false;
      })
      .addCase(processPayment.fulfilled, (state, { payload }) => {
        state.payment.isProcessing = false;
        state.payment.success = true;
        state.payment.error = null;
        // Update booking status
        const index = state.bookings.findIndex(booking => booking.id === payload.bookingId);
        if (index !== -1) {
          state.bookings[index].paymentStatus = 'paid';
        }
        if (state.selectedBooking?.id === payload.bookingId) {
          state.selectedBooking.paymentStatus = 'paid';
        }
      })
      .addCase(processPayment.rejected, (state, { payload }) => {
        state.payment.isProcessing = false;
        state.payment.error = payload;
        state.payment.success = false;
      })
      // Handle updateBooking
      .addCase(updateBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(booking => booking.id === payload.id);
        if (index !== -1) {
          state.bookings[index] = payload;
        }
        if (state.selectedBooking?.id === payload.id) {
          state.selectedBooking = payload;
        }
        state.error = null;
      })
      .addCase(updateBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle cancelBooking
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(booking => booking.id === payload.id);
        if (index !== -1) {
          state.bookings[index] = payload;
        }
        if (state.selectedBooking?.id === payload.id) {
          state.selectedBooking = payload;
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle rateBooking
      .addCase(rateBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rateBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(booking => booking.id === payload.id);
        if (index !== -1) {
          state.bookings[index] = payload;
        }
        if (state.selectedBooking?.id === payload.id) {
          state.selectedBooking = payload;
        }
        state.error = null;
      })
      .addCase(rateBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle confirmBooking
      .addCase(confirmBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(booking => booking.id === payload.id);
        if (index !== -1) {
          state.bookings[index] = payload;
        }
        if (state.selectedBooking?.id === payload.id) {
          state.selectedBooking = payload;
        }
        state.error = null;
      })
      .addCase(confirmBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Handle completeBooking
      .addCase(completeBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeBooking.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.bookings.findIndex(booking => booking.id === payload.id);
        if (index !== -1) {
          state.bookings[index] = payload;
        }
        if (state.selectedBooking?.id === payload.id) {
          state.selectedBooking = payload;
        }
        state.error = null;
      })
      .addCase(completeBooking.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
  }
});

// Actions
export const {
  setSelectedBooking,
  updateBookingForm,
  clearBookingForm,
  setError,
  resetPaymentState,
} = bookingsSlice.actions;

// Selectors
export const selectSelectedBooking = (state) => state.bookings.selectedBooking;
export const selectBookings = (state) => state.bookings.bookings;
export const selectBookingForm = (state) => state.bookings.bookingForm;
export const selectBookingError = (state) => state.bookings.error;
export const selectPaymentState = (state) => state.bookings.payment;

export default bookingsSlice.reducer; 