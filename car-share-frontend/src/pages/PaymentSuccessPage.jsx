import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '../hooks/usePayments';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { clearIntent } = usePayments();

  useEffect(() => {
    // Clear payment intent from state
    clearIntent();

    // Redirect to bookings page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/bookings');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, clearIntent]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your payment. Your booking has been confirmed.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Redirecting to your bookings...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 