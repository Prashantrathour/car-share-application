import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTripById, selectSelectedTrip, selectTripsLoading, selectTripError } from '../../features/trips';
import { fetchMessages, sendMessage } from '../../features/chat/chatThunks';
import { selectMessages } from '../../features/chat/chatSlice';
import { motion, AnimatePresence } from 'framer-motion';
import CreateReview from '../reviews/CreateReview';
import { toast } from 'react-hot-toast';
import useTrip from '../../hooks/useTrip';
import TripMap from '../map/TripMap';
import TripChat from '../TripChat';


const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const trip = useSelector(selectSelectedTrip);
  const isLoading = useSelector(selectTripsLoading);
  const error = useSelector(selectTripError);
  // const [newMessage, setNewMessage] = useState('');
  const [bookingError, setBookingError] = useState(null);
  const [bookingData, setBookingData] = useState({
    numberOfSeats: 1,
    pickupLocation: null,
    dropoffLocation: null,
    passengerNotes: '',
    baggageCount: 0,
    specialRequests: []
  });
  const messagesEndRef = useRef(null);
  // const currentUser = useSelector((state) /=> state.auth.user);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const messages = useSelector(selectMessages);
  const { createBooking, isCreatingBooking } = useTrip();

  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripById(tripId));
      dispatch(fetchMessages(tripId))
    }
  }, [dispatch, tripId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    if (trip) {
      setBookingData(prev => ({
        ...prev,
        pickupLocation: {
          latitude: trip.startLocation.latitude,
          longitude: trip.startLocation.longitude,
          address: trip.startLocation.address
        },
        dropoffLocation: {
          latitude: trip.endLocation.latitude,
          longitude: trip.endLocation.longitude,
          address: trip.endLocation.address
        }
      }));
    }
  }, [trip]);


  // const handleSendMessage = async (e) => {
  //   e.preventDefault();
  //   if (!newMessage.trim()) return;

  //   try {
  //     await dispatch(sendMessage({
  //       tripId: tripId,
  //       content: newMessage.trim(),
  //     })).unwrap();
  //     setNewMessage('');
  //   } catch (err) {
  //     console.error('Failed to send message:', err);
  //   }
  // };

  const handleBooking = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    
    try {
      setBookingError(null); // Clear any existing errors
      
      // Validate number of seats
      if (bookingData.numberOfSeats > trip.availableSeats) {
        setBookingError({
          type: 'validation',
          message: `Only ${trip.availableSeats} seats available`
        });
        return;
      }

      // Validate baggage count
      if (bookingData.baggageCount < 0) {
        setBookingError({
          type: 'validation',
          message: 'Number of bags cannot be negative'
        });
        return;
      }

      const result = await createBooking({ tripId: tripId, ...bookingData });
      
      if (result?.success) {
        toast.success('Booking created successfully!');
        navigate('/bookings'); // Redirect to bookings page
      } else {
        setBookingError({
          type: 'api',
          message: result?.error || 'Failed to create booking. Please try again.'
        });
        toast.error(result?.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      setBookingError({
        type: 'api',
        message: error?.message || 'An unexpected error occurred. Please try again.'
      });
      toast.error('Failed to create booking. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading trip details: {error.message}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {trip.startLocation.address.split(',')[0]} → {trip.endLocation.address.split(',')[0]}
              </h1>
              <p className="mt-2 text-gray-600">
                {new Date(trip.startTime).toLocaleString()}
              </p>
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              ${trip.pricePerSeat}
            </span>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900">Driver Details</h2>
            <div className="mt-4 flex items-center">
              <img
                src={trip?.driver?.avatar || `https://ui-avatars.com/api/?name=${trip?.driver?.firstName}+${trip?.driver?.lastName}&background=random`}
                alt={trip?.driver?.firstName}
                className="h-12 w-12 rounded-full"
              />
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900">
                  {trip?.driver?.firstName} {trip?.driver?.lastName}
                </p>
                <p className="text-gray-500">{trip?.driver?.rating} ★</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900">Trip Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                <dd className="mt-1 text-lg text-gray-900">{trip?.vehicle?.year} {trip?.vehicle?.make} {trip?.vehicle?.model} • {trip?.vehicle?.color}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Available Seats
                </dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {trip.availableSeats}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Estimated Duration
                </dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {trip?.estimatedDuration} minutes
                </dd>
                <dt className="text-sm font-medium text-gray-500">
                  Start Complete Location
                </dt>
                <dd className="mt-1 text-sm text-gray-600 font-bold">
                  {trip?.startLocation?.address}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  End Complete Location
                </dt>
                <dd className="mt-1 text-sm text-gray-600 font-bold">
                  {trip?.endLocation?.address}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => navigate('/trips')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Trips
            </button>
            <button
              onClick={handleBooking}
              disabled={isCreatingBooking || trip?.availableSeats === 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCreatingBooking
                ? 'Booking...'
                : trip?.availableSeats === 0
                ? 'Fully Booked'
                : 'Book Now'}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <CreateReview
              tripId={tripId}
              onClose={() => setShowReviewModal(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">
              {trip.startLocation.address.split(',')[0]} →{' '}
              {trip.endLocation.address.split(',')[0]}
            </h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Departure</h3>
                <p className="mt-1">
                  {new Date(trip.startTime).toLocaleDateString()}{' '}
                  {new Date(trip.startTime).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Arrival</h3>
                <p className="mt-1">
                  {new Date(trip.endTime).toLocaleDateString()}{' '}
                  {new Date(trip.endTime).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price per Seat</h3>
                <p className="mt-1">${trip.pricePerSeat}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estimated Duration</h3>
                <p className="mt-1">{trip?.estimatedDuration} minutes</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Distance</h3>
                <p className="mt-1">{trip.estimatedDistance} K.M.</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium mb-4">Route Map</h2>
              <TripMap waypoints={trip.route.waypoints} />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">Driver & Vehicle</h2>
              <div className="flex items-center">
                <img
                  src={trip?.driver?.avatar || `https://ui-avatars.com/api/?name=${trip?.driver?.firstName}+${trip?.driver?.lastName}&background=random`}
                  alt={`${trip?.driver?.firstName} ${trip?.driver?.lastName}`}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-medium">
                    {trip?.driver?.firstName} {trip?.driver?.lastName}
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1">{trip?.driver?.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {trip?.vehicle?.year} {trip?.vehicle?.make} {trip?.vehicle?.model} • {trip?.vehicle?.color}
                  </p>
                  <p className="text-sm text-gray-500">
                    License Plate: {trip?.vehicle?.licensePlate}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t mt-6 pt-6">
              <h2 className="text-lg font-medium mb-4">Preferences</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <svg className={`w-5 h-5 ${trip.preferences.smoking ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2">Smoking</span>
                </div>
                <div className="flex items-center">
                  <svg className={`w-5 h-5 ${trip.preferences.music ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2">Music</span>
                </div>
                <div className="flex items-center">
                  <svg className={`w-5 h-5 ${trip.preferences.pets ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2">Pets</span>
                </div>
              </div>
            </div>

{/* <TripChat tripId={tripId} /> */}
            {trip.notes && (
              <div className="border-t mt-6 pt-6">
                <h2 className="text-lg font-medium mb-2">Additional Notes</h2>
                <p className="text-gray-600">{trip.notes}</p>
              </div>
            )}
          </div>
        
          {/* Chat Section */}
          {/* <div className="bg-white shadow rounded-lg mt-8 p-6"> */}
            {/* <h2 className="text-lg font-medium mb-4">Trip Chat</h2> */}
            {/* <div className="h-96 overflow-y-auto mb-4 space-y-2">
              <TripChat tripId={tripId} />
              <div ref={messagesEndRef} />
              {/* {messages&&messages?.map((message) => (
                <div
                  key={message?.id}
                  className={`flex ${
                    message?.senderId === currentUser?.tripId
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message?.senderId === currentUser?.tripId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {message?.sender?.firstName} {message?.sender?.lastName}
                    </p>
                    {message.type === 'location' ? (
                      <div>
                        <p>{message?.content}</p>
                        <p className="text-xs mt-1">📍 {message?.metadata?.address}</p>
                      </div>
                    ) : (
                      <p>{message?.content}</p>
                    )}
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message?.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form> */}
          {/* </div>  */}
          
          {/* </div> */}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-8">
            <h2 className="text-lg font-medium mb-4">Book This Trip</h2>
            {bookingError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{bookingError.message}</p>
              </div>
            )}
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={trip.availableSeats}
                  value={bookingData.numberOfSeats}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > trip.availableSeats) {
                      setBookingError({
                        type: 'validation',
                        message: `Only ${trip.availableSeats} seats available`
                      });
                    } else {
                      setBookingError(null);
                    }
                    setBookingData((prev) => ({
                      ...prev,
                      numberOfSeats: value
                    }));
                  }}
                  className={`border rounded-md p-2 w-full ${
                    bookingError?.type === 'validation' ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  required
                />
                {bookingError?.type === 'validation' && (
                  <p className="mt-1 text-xs text-red-600">{bookingError.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Bags
                </label>
                <input
                  type="number"
                  min="0"
                  value={bookingData.baggageCount}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      baggageCount: parseInt(e.target.value)
                    }))
                  }
                  className="border rounded-md p-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <div className="space-y-2">
                  {['wheelchair_accessible', 'quiet_preferred'].map((request) => (
                    <label key={request} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={bookingData.specialRequests.includes(request)}
                        onChange={(e) => {
                          setBookingData((prev) => ({
                            ...prev,
                            specialRequests: e.target.checked
                              ? [...prev.specialRequests, request]
                              : prev.specialRequests.filter((r) => r !== request)
                          }));
                        }}
                        className="rounded border-gray-300 text-indigo-600 mr-2"
                      />
                      {request.replace('_', ' ').charAt(0).toUpperCase() +
                        request.replace('_', ' ').slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for Driver
                </label>
                <textarea
                  value={bookingData.passengerNotes}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      passengerNotes: e.target.value
                    }))
                  }
                  rows="3"
                  className="border rounded-md p-2 w-full"
                  placeholder="Any special instructions or requests..."
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Price per seat</span>
                  <span>${trip.pricePerSeat}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Total price</span>
                  <span className="font-medium">
                    ${(parseFloat(trip.pricePerSeat) * bookingData.numberOfSeats).toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                   disabled={isCreatingBooking || trip?.availableSeats === 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCreatingBooking
                ? 'Booking...'
                : trip?.availableSeats === 0
                ? 'Fully Booked'
                : 'Book Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;