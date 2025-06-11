import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { userReducer } from '../../features/user';
import TripChat from '../TripChat';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { getBooking, cancelExistingBooking, confirmOrRejectBooking, rateExistingBooking } = useBookings();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const bookingData = await getBooking(bookingId);
        if (bookingData) {
          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        setError('Failed to load booking details');
        console.error('Error loading booking:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelExistingBooking(bookingId, 'Cancelled by user');
      navigate('/bookings');
    }
  };

  const handleConfirm = async () => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      await confirmOrRejectBooking(bookingId, 'confirm', 'Booking confirmed by driver');
      navigate('/bookings');
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      await confirmOrRejectBooking(bookingId, 'reject', 'Booking rejected by driver');
      navigate('/bookings');
    }
  };

  const handleReview = () => {
    navigate(`/bookings/${bookingId}/review`);
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

              
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading booking</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Booking not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The booking you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-4">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Booking Details
            </h3>
            <div className="flex space-x-3">
              {/* Passenger Actions */}
              {user?.role === 'user' && (
                <>
                  {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                    <button
                      onClick={() => navigate(`/payment/${bookingId}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Make Payment
                    </button>
                  )}
                  {booking.status === 'pending' && (
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.isReviewedByPassenger && (
                    <button
                      onClick={handleReview}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Leave Review
                    </button>
                  )}
                </>
              )}

              {/* Driver Actions */}
              {user?.role === 'driver' && booking.trip.driver?.id === user.id && (
                <>
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={handleConfirm}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={handleReject}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject Booking
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {/* Booking Status and Payment Status */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Booking Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </span>
              </dd>
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Trip Details</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p>From: {booking.trip.startLocation?.address || booking.pickupLocation?.address}</p>
                <p>To: {booking.trip.endLocation?.address || booking.dropoffLocation?.address}</p>
                <p>Date: {new Date(booking.trip.startTime).toLocaleDateString()}</p>
                <p>Time: {new Date(booking.trip.startTime).toLocaleTimeString()}</p>
                <p>Estimated Duration: {Math.round(booking.trip.estimatedDuration / 60)} minutes</p>
                <p>Estimated Distance: {booking.trip.estimatedDistance} km</p>
              </dd>
            </div>

            {/* Driver Information */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Driver Information</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <img
                    src={booking.trip.driver?.avatar}
                    alt={`${booking.trip.driver?.firstName} ${booking.trip.driver?.lastName}`}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{booking.trip.driver?.firstName} {booking.trip.driver?.lastName}</p>
                  </div>
                </div>
              </dd>
            </div>

            {/* Passenger Information */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Passenger Information</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <img
                    src={booking.passenger?.avatar}
                    alt={`${booking.passenger?.firstName} ${booking.passenger?.lastName}`}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{booking.passenger?.firstName} {booking.passenger?.lastName}</p>
                  </div>
                </div>
              </dd>
            </div>

            {/* Trip Chat */}
            {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Trip Chat</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="h-96 overflow-y-auto border rounded-lg">
                    {booking?.tripId && <TripChat tripId={booking.tripId} />}
                  </div>
                </dd>
              </div>
            )}

            {/* Trip Preferences */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Trip Preferences</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      booking.trip.preferences.smoking ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>Smoking: {booking.trip.preferences.smoking ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      booking.trip.preferences.music ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>Music: {booking.trip.preferences.music ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      booking.trip.preferences.pets ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>Pets: {booking.trip.preferences.pets ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      booking.trip.preferences.luggage ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>Luggage: {booking.trip.preferences.luggage ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      booking.trip.preferences.airConditioner ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>Air Conditioner: {booking.trip.preferences.airConditioner ? 'Available' : 'Not Available'}</span>
                  </div>
                </div>
              </dd>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Booking Details</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p>Booking ID: {booking.id}</p>
                <p>Number of Seats: {booking.numberOfSeats}</p>
                <p>Total Price: ${Number(booking.totalPrice).toFixed(2)}</p>
                <p>Pickup Code: {booking.pickupCode}</p>
                {booking.passengerNotes && <p>Passenger Notes: {booking.passengerNotes}</p>}
                {booking.driverNotes && <p>Driver Notes: {booking.driverNotes}</p>}
                <p>Created At: {new Date(booking.createdAt).toLocaleString()}</p>
                <p>Updated At: {new Date(booking.updatedAt).toLocaleString()}</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;