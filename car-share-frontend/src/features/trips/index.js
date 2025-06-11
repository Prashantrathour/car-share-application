// Re-export everything from tripsSlice
export {
  default as tripsReducer,
  setSelectedTrip,
  setFilters,
  clearFilters,
 setError,
  selectTrips,
  selectSelectedTrip,
  selectTripFilters,
  selectTripError,
  selectTripsLoading
} from './tripsSlice';

// Re-export everything from tripsThunks
export {
  fetchTrips,
  fetchTripById,
  fetchTrip,
  createNewTrip,
  updateExistingTrip,
  deleteExistingTrip
} from './tripsThunks'; 