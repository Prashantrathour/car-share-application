import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { 
  createNewTrip, 
  fetchTrips, 
  fetchTripById,
  selectTrips,
  selectSelectedTrip,
  selectTripsLoading
} from '../features/trips';
import { 
  createBooking,
  selectBookingForm,
  selectBookingError
} from '../features/bookings';
import { toast } from 'react-hot-toast';

const useTrip = () => {
  const dispatch = useDispatch();
  const isCreatingTrip = useSelector(state => state.trips.isLoading);
  const isCreatingBooking = useSelector(state => state.bookings.isLoading);
  
  const handleCreateTrip = async (tripData) => {
    try {
      const result = await dispatch(createNewTrip(tripData)).unwrap();
      toast.success('Trip created successfully!');
      return { success: true, data: result };
    } catch (error) {
      toast.error(error.message || 'Failed to create trip');
      return { success: false, error };
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      const result = await dispatch(createBooking(bookingData)).unwrap();
      toast.success('Booking created successfully!');
      return { success: true, data: result };
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
      return { success: false, error };
    }
  };

  const useGetTripById = (tripId) => {
    const trip = useSelector(selectSelectedTrip);
    const isLoading = useSelector(selectTripsLoading);
    const error = useSelector(state => state.trips.error);
    
    useEffect(() => {
      if (tripId) {
        dispatch(fetchTripById(tripId));
      }
    }, [dispatch, tripId]);
    
    return { data: trip, isLoading, error };
  };

  return {
    handleCreateTrip,
    handleCreateBooking,
    useGetTripById,
    isCreatingTrip,
    isCreatingBooking,
    createBooking: handleCreateBooking
  };
};

export default useTrip; 