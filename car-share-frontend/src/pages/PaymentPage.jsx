import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { usePayments } from '../hooks/usePayments';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { getBooking, processBookingPayment } = useBookings();
  const { paymentIntent, error: paymentError, createNewPaymentIntent } = usePayments();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const bookingData = await getBooking(bookingId);
        if (bookingData) {
          setBooking(bookingData);
          // Create payment intent when booking is loaded
          await createNewPaymentIntent(bookingId, Number(bookingData.totalPrice));
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const result = await processBookingPayment(paymentIntent.id, bookingId);
      if (result) {
        navigate(`/payment/success`);
      }
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || paymentError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || paymentError}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Invalid Booking</h3>
          <p className="mt-2 text-sm text-gray-500">
            This booking is not available for payment.
          </p>
        </div>
      </div>
    );
  }
console.log(paymentIntent)
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Payment</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please complete your payment to confirm your booking.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">From:</span> {booking.pickupLocation?.address}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span> {booking.dropoffLocation?.address}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span> {new Date(booking.trip.startTime).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time:</span> {new Date(booking.trip.startTime).toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Seats:</span> {booking.numberOfSeats}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Trip Details</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Driver:</span> {booking.trip.driver.firstName} {booking.trip.driver.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Estimated Duration:</span> {Math.round(booking.trip.estimatedDuration / 60)} minutes
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Distance:</span> {booking.trip.estimatedDistance} km
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Price per Seat:</span> ${booking.trip.pricePerSeat}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Trip Preferences</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Air Conditioning:</span> {booking.trip.preferences.airConditioner ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Music:</span> {booking.trip.preferences.music ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Luggage:</span> {booking.trip.preferences.luggage ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Payment Amount</h3>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              ${Number(booking?.totalPrice).toFixed(2)}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                For development purposes, this is a simulated payment. Click the button below to complete the payment.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Complete Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 