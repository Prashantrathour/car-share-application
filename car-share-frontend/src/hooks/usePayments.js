import { useState } from 'react';
import { toast } from 'react-hot-toast';

export const usePayments = () => {
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Create a new payment intent
   */
  const createNewPaymentIntent = async (bookingId, amount) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a simulated payment intent
      const intent = {
        id: `pi_${Date.now()}`,
        amount,
        bookingId,
        status: 'pending'
      };
      
      setPaymentIntent(intent);
      return intent;
    } catch (err) {
      setError('Failed to create payment intent');
      toast.error('Failed to create payment intent');
      return null;
    }
  };

  /**
   * Confirm a payment intent
   */
  const confirmPaymentIntent = async (paymentIntentId, bookingId) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (!success) {
        throw new Error('Payment processing failed');
      }

      // Update payment intent status
      setPaymentIntent(prev => ({
        ...prev,
        status: 'succeeded'
      }));

      return {
        id: paymentIntentId||'pi_1',
        status: 'succeeded',
        bookingId
      };
    } catch (err) {
      setError('Payment processing failed');
      toast.error('Payment processing failed');
      return null;
    }
  };

  /**
   * Get payment history
   */
  const getPaymentHistory = async (page = 1, limit = 10) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return dummy payment history
      return {
        payments: [
          {
            id: 'pi_1',
            amount: 50,
            status: 'succeeded',
            date: new Date().toISOString()
          }
        ],
        total: 1,
        page,
        limit
      };
    } catch (err) {
      setError('Failed to fetch payment history');
      toast.error('Failed to fetch payment history');
      return null;
    }
  };

  /**
   * Get payment details
   */
  const getPaymentDetails = async (paymentId) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return dummy payment details
      return {
        id: paymentId,
        amount: 50,
        status: 'succeeded',
        date: new Date().toISOString(),
        method: 'credit_card'
      };
    } catch (err) {
      setError('Failed to fetch payment details');
      toast.error('Failed to fetch payment details');
      return null;
    }
  };

  /**
   * Process a refund
   */
  const refundExistingPayment = async (paymentId, reason) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (!success) {
        throw new Error('Refund processing failed');
      }

      return {
        id: paymentId,
        status: 'refunded',
        reason
      };
    } catch (err) {
      setError('Failed to process refund');
      toast.error('Failed to process refund');
      return null;
    }
  };

  /**
   * Clear the current payment intent
   */
  const clearIntent = () => {
    setPaymentIntent(null);
    setError(null);
  };

  /**
   * Set payment error
   */
  const setPaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  return {
    paymentIntent,
    error,
    createNewPaymentIntent,
    confirmPaymentIntent,
    getPaymentHistory,
    getPaymentDetails,
    refundExistingPayment,
    clearIntent,
    setPaymentError
  };
};

export default usePayments; 