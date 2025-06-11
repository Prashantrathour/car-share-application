import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Map components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Icons
import { FaSearch, FaMapMarkerAlt, FaCar, FaUser, FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const CarpoolFinder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startLocation: { latitude: '', longitude: '', address: '' },
    endLocation: { latitude: '', longitude: '', address: '' },
    startTime: '',
    endTime: '',
    radius: 5
  });
  const [carpoolOptions, setCarpoolOptions] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Handle input changes
  const handleInputChange = (e, locationType, field) => {
    const { value } = e.target;
    
    if (locationType) {
      setSearchParams({
        ...searchParams,
        [locationType]: {
          ...searchParams[locationType],
          [field]: value
        }
      });
    } else {
      setSearchParams({
        ...searchParams,
        [field]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate inputs
      if (!searchParams.startLocation.latitude || !searchParams.startLocation.longitude ||
          !searchParams.endLocation.latitude || !searchParams.endLocation.longitude ||
          !searchParams.startTime || !searchParams.endTime) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Get access token from local storage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('You must be logged in to search for carpools');
        navigate('/login');
        return;
      }
      
      // Make API request to find carpool options
      const response = await axios.get(`${API_URL}/trips/carpool`, {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update state with results
      setCarpoolOptions(response.data.data || []);
      
      if (response.data.results === 0) {
        toast.info('No carpooling options found for your route and time');
      } else {
        toast.success(`Found ${response.data.results} carpooling options`);
      }
    } catch (error) {
      console.error('Error searching for carpools:', error);
      toast.error(error.response?.data?.message || 'Failed to search for carpools');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle joining a carpool
  const handleJoinCarpool = async (trip) => {
    setLoading(true);
    
    try {
      // Get access token from local storage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('You must be logged in to join a carpool');
        navigate('/login');
        return;
      }
      
      // Create waypoint data for pickup and dropoff
      const pickupWaypoint = {
        location: searchParams.startLocation,
        type: 'pickup',
        notes: 'Passenger pickup location',
      };
      
      // Add waypoint to the trip
      await axios.post(`${API_URL}/trips/${trip.id}/waypoints`, pickupWaypoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Create booking for the trip
      await axios.post(`${API_URL}/bookings`, {
        tripId: trip.id,
        numberOfSeats: 1,
        pickupLocation: searchParams.startLocation,
        dropoffLocation: searchParams.endLocation,
        totalPrice: trip.pricePerSeat,
        specialRequests: [],
        baggageCount: 1,
        passengerNotes: 'Joined via carpool finder'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Successfully joined the carpool!');
      navigate('/bookings');
    } catch (error) {
      console.error('Error joining carpool:', error);
      toast.error(error.response?.data?.message || 'Failed to join carpool');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle using current location
  const handleUseCurrentLocation = (locationType) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams({
            ...searchParams,
            [locationType]: {
              ...searchParams[locationType],
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          });
          
          // Get address from coordinates with reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || '';
              setSearchParams(prev => ({
                ...prev,
                [locationType]: {
                  ...prev[locationType],
                  address
                }
              }));
            })
            .catch(error => {
              console.error('Error getting address:', error);
            });
        },
        (error) => {
          console.error('Error getting current location:', error);
          toast.error('Could not access your location. Please check browser permissions.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Find Carpools Near You</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="inline mr-2 text-green-600" />
                Pickup Location
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Pickup address"
                  value={searchParams.startLocation.address}
                  onChange={(e) => handleInputChange(e, 'startLocation', 'address')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation('startLocation')}
                  className="bg-gray-200 p-2 rounded-md hover:bg-gray-300"
                >
                  <FaMapMarkerAlt className="text-gray-700" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={searchParams.startLocation.latitude}
                  onChange={(e) => handleInputChange(e, 'startLocation', 'latitude')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={searchParams.startLocation.longitude}
                  onChange={(e) => handleInputChange(e, 'startLocation', 'longitude')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            
            {/* Dropoff location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="inline mr-2 text-red-600" />
                Dropoff Location
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Dropoff address"
                  value={searchParams.endLocation.address}
                  onChange={(e) => handleInputChange(e, 'endLocation', 'address')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation('endLocation')}
                  className="bg-gray-200 p-2 rounded-md hover:bg-gray-300"
                >
                  <FaMapMarkerAlt className="text-gray-700" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={searchParams.endLocation.latitude}
                  onChange={(e) => handleInputChange(e, 'endLocation', 'latitude')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={searchParams.endLocation.longitude}
                  onChange={(e) => handleInputChange(e, 'endLocation', 'longitude')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date/time inputs */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Start Time
              </label>
              <input
                type="datetime-local"
                value={searchParams.startTime}
                onChange={(e) => handleInputChange(e, null, 'startTime')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                End Time
              </label>
              <input
                type="datetime-local"
                value={searchParams.endTime}
                onChange={(e) => handleInputChange(e, null, 'endTime')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FaSearch className="inline mr-2 text-purple-600" />
                Search Radius (km)
              </label>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={searchParams.radius}
                onChange={(e) => handleInputChange(e, null, 'radius')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" /> Find Carpools
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {carpoolOptions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Available Carpools ({carpoolOptions.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {carpoolOptions.map((trip) => (
              <div
                key={trip.id}
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                  selectedTrip?.id === trip.id ? 'border-green-500' : 'border-gray-300'
                } hover:border-green-500 transition-colors cursor-pointer`}
                onClick={() => setSelectedTrip(trip)}
              >
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    <FaCar className="inline mr-2 text-blue-600" />
                    {trip.driver ? `${trip.driver.firstName}'s Trip` : 'Available Trip'}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="mr-1" />
                    <span>{trip.driver?.rating || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaMapMarkerAlt className="text-green-600" />
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium">Pickup: {trip.startLocation.address}</p>
                      <p className="text-xs text-gray-500">Distance: {trip.startDistanceKm?.toFixed(1)} km from your location</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaMapMarkerAlt className="text-red-600" />
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium">Dropoff: {trip.endLocation.address}</p>
                      <p className="text-xs text-gray-500">Distance: {trip.endDistanceKm?.toFixed(1)} km from your destination</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-1" />
                      <span>{new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUser className="mr-1" />
                      <span>{trip.availableSeats} seats available</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${trip.pricePerSeat?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">per seat</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinCarpool(trip);
                    }}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Join Carpool'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedTrip && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Trip Route</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '400px' }}>
            <MapContainer 
              center={[parseFloat(selectedTrip.startLocation.latitude), parseFloat(selectedTrip.startLocation.longitude)]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Start location marker */}
              <Marker position={[parseFloat(selectedTrip.startLocation.latitude), parseFloat(selectedTrip.startLocation.longitude)]}>
                <Popup>
                  <b>Trip Start:</b> {selectedTrip.startLocation.address}
                </Popup>
              </Marker>
              
              {/* End location marker */}
              <Marker position={[parseFloat(selectedTrip.endLocation.latitude), parseFloat(selectedTrip.endLocation.longitude)]}>
                <Popup>
                  <b>Trip End:</b> {selectedTrip.endLocation.address}
                </Popup>
              </Marker>
              
              {/* Your pickup marker */}
              {searchParams.startLocation.latitude && searchParams.startLocation.longitude && (
                <Marker position={[parseFloat(searchParams.startLocation.latitude), parseFloat(searchParams.startLocation.longitude)]}>
                  <Popup>
                    <b>Your Pickup:</b> {searchParams.startLocation.address}
                  </Popup>
                </Marker>
              )}
              
              {/* Your dropoff marker */}
              {searchParams.endLocation.latitude && searchParams.endLocation.longitude && (
                <Marker position={[parseFloat(searchParams.endLocation.latitude), parseFloat(searchParams.endLocation.longitude)]}>
                  <Popup>
                    <b>Your Dropoff:</b> {searchParams.endLocation.address}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarpoolFinder; 