import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  selectSelectedBooking,
  selectBookingForm,
  selectBookingError,
  selectPaymentState,
  setSelectedBooking,
  updateBookingForm,
  clearBookingForm,
  resetPaymentState,
  createBooking,
  fetchBooking,
  fetchSingleBooking,
  updateBooking,
  cancelBooking,
  rateBooking,
  confirmBooking,
  processPayment
} from '../features/bookings';
import { usePayments } from './usePayments';
import { completeBooking } from '../features/bookings/bookingsThunks';

export const useBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const payments = usePayments();
  
  // Get bookings state from Redux
  const selectedBooking = useSelector(selectSelectedBooking);
  const bookingForm = useSelector(selectBookingForm);
  const error = useSelector(selectBookingError);
  const paymentState = useSelector(selectPaymentState);
  
  /**
   * Update the booking form
   */
  const updateForm = (formData) => {
    dispatch(updateBookingForm(formData));
  };
  
  /**
   * Clear the booking form
   */
  const clearForm = () => {
    dispatch(clearBookingForm());
  };

  /**
   * Reset payment state
   */
  const resetPayment = () => {
    dispatch(resetPaymentState());
  };
  
  /**
   * Create a new booking and initiate payment
   */
  const createNewBooking = async (bookingData) => {
    try {
      // Create booking
      const resultAction = await dispatch(createBooking(bookingData));
      
      if (createBooking.fulfilled.match(resultAction)) {
        const booking = resultAction.payload;
        
        // Create payment intent
        const paymentIntent = await payments.createNewPaymentIntent(
          booking.id,
          booking.totalPrice
        );
        
        if (paymentIntent) {
          toast.success('Booking created successfully. Please complete the payment.');
          // Redirect to payment page
          navigate(`/payment/${booking.id}`);
          return { booking, paymentIntent };
        } else {
          // If payment intent creation fails, we should handle the booking accordingly
          toast.error('Booking created but payment setup failed');
          return { booking, paymentIntent: null };
        }
      } else {
        toast.error(resultAction.payload || 'Failed to create booking');
        return null;
      }
    } catch (error) {
      toast.error('Failed to create booking');
      return null;
    }
  };

  /**
   * Process payment for a booking
   */
  const processBookingPayment = async (paymentIntentId, bookingId) => {
    try {
      const result = await payments.confirmPaymentIntent(paymentIntentId||'pi_1', bookingId);
      
      if (result) {
        // Update booking status if needed
        await updateExistingBooking(bookingId, {
          paymentIntentId:paymentIntentId,
          paymentStatus: 'paid'
        });
       
      }
      return result;
    } catch (error) {
      toast.error('Payment processing failed');
      return null;
    }
  };
  
  /**
   * Fetch all bookings
   */
  const getAllBookings = async () => {
    try {
      const resultAction = await dispatch(fetchBooking());
      
      if (fetchBooking.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to fetch bookings');
        return null;
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
      return null;
    }
  };

  /**
   * Fetch a single booking by ID
   */
  const getBooking = async (bookingId) => {
    try {
      const resultAction = await dispatch(fetchSingleBooking(bookingId));
      
      if (fetchSingleBooking.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to fetch booking');
        return null;
      }
    } catch (error) {
      toast.error('Failed to fetch booking');
      return null;
    }
  };
  
  /**
   * Update an existing booking
   */
  const updateExistingBooking = async (bookingId, bookingData) => {
    try {
      const resultAction = await dispatch(updateBooking({ id: bookingId, bookingData }));
      
      if (updateBooking.fulfilled.match(resultAction)) {
        toast.success('Booking updated successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to update booking');
        return null;
      }
    } catch (error) {
      toast.error('Failed to update booking');
      return null;
    }
  };
  
  /**
   * Cancel a booking and handle refund if needed
   */
  const cancelExistingBooking = async (bookingId, cancellationReason) => {
    try {
      const booking = await getBooking(bookingId);
      if (!booking) return null;

      // If booking is paid, process refund first
      if (booking.paymentStatus === 'paid' && booking.paymentId) {
        await payments.refundExistingPayment(booking.paymentId, cancellationReason);
      }

      // Cancel the booking
      const resultAction = await dispatch(cancelBooking({ id: bookingId, cancellationReason }));
      
      if (cancelBooking.fulfilled.match(resultAction)) {
        toast.success('Booking cancelled successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to cancel booking');
        return null;
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
      return null;
    }
  };

  /**
   * Rate a booking
   */
  const rateExistingBooking = async (bookingId, rating, comment) => {
    try {
      const resultAction = await dispatch(rateBooking({ id: bookingId, rating, comment }));
      
      if (rateBooking.fulfilled.match(resultAction)) {
        toast.success('Rating submitted successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to submit rating');
        return null;
      }
    } catch (error) {
      toast.error('Failed to submit rating');
      return null;
    }
  };

  /**
   * Confirm or reject a booking (for drivers)
   */
  const confirmOrRejectBooking = async (bookingId, action, reason) => {
    try {
      const resultAction = await dispatch(confirmBooking({ id: bookingId, action, reason }));
      
      if (confirmBooking.fulfilled.match(resultAction)) {
        toast.success(action === 'confirm' ? 'Booking confirmed successfully' : 'Booking rejected successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || `Failed to ${action} booking`);
        return null;
      }
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
      return null;
    }
  };
  const completeBookingStatus = async (bookingId, action, reason) => {
    try {
      const resultAction = await dispatch(completeBooking({ id: bookingId, action, reason }));
      if (completeBooking.fulfilled.match(resultAction)) {
        toast.success('Booking completed successfully');
        return resultAction.payload;
      } else {
        toast.error(resultAction.payload || 'Failed to complete booking');
        return null;
      }
    } catch (error) {
      toast.error('Failed to complete booking');
      return null;
    }
  };
  
  return {
    // State
    selectedBooking,
    bookingForm,
    error,
    paymentState,
    
    // Actions
    updateForm,
    clearForm,
    resetPayment,
    createNewBooking,
    processBookingPayment,
    getAllBookings,
    getBooking,
    updateExistingBooking,
    cancelExistingBooking,
    rateExistingBooking,
    confirmOrRejectBooking,
    completeBookingStatus
  };
};

export default useBookings; 