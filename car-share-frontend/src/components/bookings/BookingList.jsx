import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooking } from '../../features/bookings';
import { selectBookings } from '../../features/bookings/bookingsSlice';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
// import { completeBooking } from '../../features/bookings/bookingsThunks';

const BookingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getAllBookings, 
    cancelExistingBooking, 
    confirmOrRejectBooking,completeBookingStatus,
    rateExistingBooking
  } = useBookings();
  
  const bookings = useSelector(selectBookings);
  const isLoading = useSelector(state => state.bookings.isLoading);
  const error = useSelector(state => state.bookings.error);

  // Filter states
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Booking status options
  const bookingStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled_by_passenger', label: 'Cancelled by Passenger' },
    { value: 'cancelled_by_driver', label: 'Cancelled by Driver' },
    { value: 'no_show', label: 'No Show' }
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'authorized', label: 'Authorized' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    const loadBookings = async () => {
      try {
        await getAllBookings();
      } catch (err) {
        console.error('Error loading bookings:', err);
      }
    };
    loadBookings();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled_by_passenger':
      case 'cancelled_by_driver':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'authorized':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelExistingBooking(bookingId, 'Cancelled by user');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      await confirmOrRejectBooking(bookingId, 'confirm', 'Booking confirmed by driver');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      await confirmOrRejectBooking(bookingId, 'reject', 'Booking rejected by driver');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to mark this booking as completed?')) {
      await completeBookingStatus(bookingId, 'complete', 'Booking completed by driver');
    }
  };

  const handlePayment = (bookingId) => {
    navigate(`/payment/${bookingId}`);
  };

  const handleReview = (bookingId) => {
    navigate(`/bookings/${bookingId}/review`);
  };

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    const matchesBookingStatus = bookingStatusFilter === 'all' || booking.status === bookingStatusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || booking.paymentStatus === paymentStatusFilter;
    return matchesBookingStatus && matchesPaymentStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <Link
          to="/trips"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Find New Trips
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Booking Status
            </label>
            <select
              id="booking-status-filter"
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {bookingStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payment-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="payment-status-filter"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {paymentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setBookingStatusFilter('all');
              setPaymentStatusFilter('all');
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading bookings</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || 'Something went wrong'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {bookings.length === 0 
              ? "You haven't booked any trips yet. Find a trip to get started!"
              : "No bookings match your current filters. Try adjusting your filters."}
          </p>
          <div className="mt-4">
            {bookings.length === 0 ? (
              <Link
                to="/trips"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Trips
              </Link>
            ) : (
              <button
                onClick={() => {
                  setBookingStatusFilter('all');
                  setPaymentStatusFilter('all');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {booking.trip.startLocation?.address?.split(',')[0] || booking.pickupLocation?.address?.split(',')[0]} 
                        {' → '} 
                        {booking.trip.endLocation?.address?.split(',')[0] || booking.dropoffLocation?.address?.split(',')[0]}
                      </p>
                      <div className="sm:ml-2 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="sm:ml-2 flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                          Payment Status: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm text-gray-500 sm:text-right">
                        ${Number(booking.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(booking.trip.startTime)} • {formatTime(booking.trip.startTime)}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {booking.trip.driver?.firstName} {booking.trip.driver?.lastName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {booking.numberOfSeats} {booking.numberOfSeats === 1 ? 'seat' : 'seats'}
                      </p>
                      <div className="ml-4 flex space-x-2">
                        {/* Passenger Actions */}
                        {user?.role === 'passenger' && (
                          <>
                            {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => handlePayment(booking.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Make Payment
                              </button>
                            )}
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                            {booking.status === 'completed' && !booking.isReviewedByPassenger && (
                              <button
                                onClick={() => handleReview(booking.id)}
                                className="text-indigo-600 hover:text-indigo-900"
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
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(booking.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                                {/* <button
                                  onClick={() => handleCompleteBooking(booking.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Complete
                                </button> */}
                              </>
                            )}
                            {(booking.status === 'in_progress' || booking.status === 'confirmed') && (
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Complete
                              </button>
                            )}
                          </>
                        )}

                        {/* View Details Link */}
                        {(booking.status === 'confirmed' || booking.status === 'completed') && (
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookingList; 