import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchTrips, selectTrips, selectTripsLoading, selectTripError } from '../../features/trips';
import { selectUserRole } from '../../features/auth';

const TripList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { trips } = useSelector(selectTrips);
  const isLoading = useSelector(selectTripsLoading);
  const error = useSelector(selectTripError);
  const userRole = useSelector(selectUserRole);

  // Filter state
  const [filters, setFilters] = useState({
    start_location: searchParams.get('start_location') || '',
    end_location: searchParams.get('end_location') || '',
    start_date: searchParams.get('start_date') || '',
    min_seats: searchParams.get('min_seats') || '',
    max_price: searchParams.get('max_price') || '',
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10'
  });

  // Initial fetch on component mount
  useEffect(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    setSearchParams(cleanFilters);
    dispatch(fetchTrips(cleanFilters));
  }, [dispatch, setSearchParams]); // Only run on mount

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // Clean up empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    // Update URL params
    setSearchParams(cleanFilters);
    
    // Reset to page 1 and fetch trips with new filters
    setFilters(prev => ({
      ...prev,
      page: '1'
    }));
    
    // Fetch trips with filters
    dispatch(fetchTrips(cleanFilters));
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
        <p className="text-red-500">Error loading trips: {error.message}</p>
      </div>
    );
  }

  // if (!trips?.length) {
  //   return (
  //     <div className="text-center py-8">
  //       <p className="text-gray-500">No trips available at the moment.</p>
  //       {(userRole === 'driver' || userRole === 'admin') && (
  //         <Link
  //           to="/trips/create"
  //           className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
  //         >
  //           Create a Trip
  //         </Link>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Available Trips</h1>
        {(userRole === 'driver' || userRole === 'admin') && (
          <Link
            to="/trips/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create a Trip
          </Link>
        )}
      </div>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label htmlFor="start_location" className="block text-sm mb-1">
              From
            </label>
            <input
              type="text"
              id="start_location"
              name="start_location"
              value={filters.start_location}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Start location"
            />
          </div>
          <div>
            <label htmlFor="end_location" className="block text-sm mb-1">
              To
            </label>
            <input
              type="text"
              id="end_location"
              name="end_location"
              value={filters.end_location}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="End location"
            />
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm mb-1">
              Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="min_seats" className="block text-sm mb-1">
              Min Seats
            </label>
            <input
              type="number"
              id="min_seats"
              name="min_seats"
              min="1"
              value={filters.min_seats}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Minimum seats"
            />
          </div>
          <div>
            <label htmlFor="max_price" className="block text-sm mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="max_price"
              name="max_price"
              min="0"
              step="0.01"
              value={filters.max_price}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Maximum price"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {!trips?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No trips available matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-shadow ${
                trip.availableSeats === 0 ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {trip.availableSeats === 0 ? (
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {trip.startLocation?.address?.split(',')[0]} → {trip.endLocation?.address?.split(',')[0]}
                      </h2>
                      <p className="text-gray-500 mt-1">
                        {new Date(trip.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">
                      ${trip.pricePerSeat}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-red-600">
                      <span className="text-sm font-medium">
                        Fully Booked
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <img
                        src={trip.driver?.avatar || `https://ui-avatars.com/api/?name=${trip.driver?.firstName}+${trip.driver?.lastName}&background=random`}
                        alt={`${trip.driver?.firstName} ${trip.driver?.lastName}`}
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {trip.driver?.firstName} {trip.driver?.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to={`/trips/${trip.id}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {trip.startLocation?.address?.split(',')[0]} → {trip.endLocation?.address?.split(',')[0]}
                        </h2>
                        <p className="text-gray-500 mt-1">
                          {new Date(trip.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">
                        ${trip.pricePerSeat}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center text-gray-600">
                        <span className="text-sm">
                          {trip.availableSeats} seats available
                        </span>
                      </div>
                      <div className="flex items-center mt-2">
                        <img
                          src={trip.driver?.avatar || `https://ui-avatars.com/api/?name=${trip.driver?.firstName}+${trip.driver?.lastName}&background=random`}
                          alt={`${trip.driver?.firstName} ${trip.driver?.lastName}`}
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {trip.driver?.firstName} {trip.driver?.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList; 