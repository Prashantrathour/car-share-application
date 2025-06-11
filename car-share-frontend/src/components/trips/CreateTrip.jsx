import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createNewTrip, selectTripsLoading } from '../../features/trips';
import { fetchVehicles, selectVehicles, selectVehiclesLoading } from '../../features/vehicles';
import axios from 'axios';
import debounce from 'lodash/debounce';

const CreateTrip = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectTripsLoading);
  const vehicles = useSelector(selectVehicles);
  const vehiclesLoading = useSelector(selectVehiclesLoading);
console.log(isLoading)
  const [formData, setFormData] = useState({
    startLocation: {
      address: '',
      latitude: '',
      longitude: '',
      city: '',
      area: '',
      pincode: ''
    },
    endLocation: {
      address: '',
      latitude: '',
      longitude: '',
      city: '',
      area: '',
      pincode: ''
    },
    startTime: '',
    endTime: '',
    availableSeats: 1,
    pricePerSeat: '',
    preferences: {
      smoking: false,
      music: false,
      pets: false,
      luggage: false,
      airConditioner: false
    },
    notes: '',
    vehicleId: '',
    estimatedDuration: '',
    estimatedDistance: '',
    route: {
      waypoints: []
    }
  });

  const [errors, setErrors] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState({
    start: [],
    end: []
  });
  const [loadingStates, setLoadingStates] = useState({
    start: false,
    end: false
  });
  const [showSuggestions, setShowSuggestions] = useState({
    start: false,
    end: false
  });

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Add distance calculation function
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const toRad = (angle) => (angle * Math.PI) / 180; // Convert degrees to radians

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  };

  // Add function to calculate and update distance
  const calculateAndUpdateDistance = (startLat, startLon, endLat, endLon) => {
    if (startLat && startLon && endLat && endLon) {
      const distance = getDistance(
        parseFloat(startLat),
        parseFloat(startLon),
        parseFloat(endLat),
        parseFloat(endLon)
      );
      setFormData(prev => ({
        ...prev,
        estimatedDistance: parseFloat(distance.toFixed(2))
      }));
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query, type) => {
      if (!query) {
        setLocationSuggestions(prev => ({
          ...prev,
          [type]: []
        }));
        setLoadingStates(prev => ({
          ...prev,
          [type]: false
        }));
        return;
      }

      try {
        setLoadingStates(prev => ({
          ...prev,
          [type]: true
        }));

        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=e8bee1f1095044d9b38f556a6b0f71e2&limit=5`
        );

        setLocationSuggestions(prev => ({
          ...prev,
          [type]: response.data.results
        }));
      } catch (err) {
        console.error('Failed to fetch location suggestions:', err);
        setLocationSuggestions(prev => ({
          ...prev,
          [type]: []
        }));
      } finally {
        setLoadingStates(prev => ({
          ...prev,
          [type]: false
        }));
      }
    }, 500),
    []
  );

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now

    if (!formData.startLocation.address) newErrors.startLocationAddress = 'Start location address is required';
    if (!formData.startLocation.latitude) newErrors.startLocationLatitude = 'Start location latitude is required';
    if (!formData.startLocation.longitude) newErrors.startLocationLongitude = 'Start location longitude is required';

    if (!formData.endLocation.address) newErrors.endLocationAddress = 'End location address is required';
    if (!formData.endLocation.latitude) newErrors.endLocationLatitude = 'End location latitude is required';
    if (!formData.endLocation.longitude) newErrors.endLocationLongitude = 'End location longitude is required';

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const startDate = new Date(formData.startTime);
      if (startDate < oneHourFromNow) {
        newErrors.startTime = 'Start time must be at least 1 hour from now';
      }
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      if (endDate <= startDate) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!formData.availableSeats || formData.availableSeats < 1) {
      newErrors.availableSeats = 'At least 1 seat must be available';
    }

    if (!formData.pricePerSeat || parseFloat(formData.pricePerSeat) < 0) {
      newErrors.pricePerSeat = 'Price per seat must be a positive number';
    }

    if (!formData.estimatedDuration) {
      newErrors.estimatedDuration = 'Estimated duration is required';
    }

    if (!formData.estimatedDistance) {
      newErrors.estimatedDistance = 'Estimated distance is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new function to calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return '';
    const durationInMinutes = Math.round((end - start) / (1000 * 60));
    return durationInMinutes;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        };

        // Calculate distance if changing lat/long manually
        if ((parent === 'startLocation' || parent === 'endLocation') && 
            (child === 'latitude' || child === 'longitude')) {
          const startLat = parent === 'startLocation' && child === 'latitude' ? 
            value : newFormData.startLocation.latitude;
          const startLon = parent === 'startLocation' && child === 'longitude' ? 
            value : newFormData.startLocation.longitude;
          const endLat = parent === 'endLocation' && child === 'latitude' ? 
            value : newFormData.endLocation.latitude;
          const endLon = parent === 'endLocation' && child === 'longitude' ? 
            value : newFormData.endLocation.longitude;

          if (startLat && startLon && endLat && endLon) {
            calculateAndUpdateDistance(startLat, startLon, endLat, endLon);
          }
        }

        return newFormData;
      });

      // Handle location input changes
      if (parent === 'startLocation' || parent === 'endLocation') {
        const locationType = parent === 'startLocation' ? 'start' : 'end';
        setShowSuggestions(prev => ({
          ...prev,
          [locationType]: true
        }));
        if (child === 'address') {
          debouncedSearch(value, locationType);
        }
      }
    } else if (name === 'availableSeats' || name === 'pricePerSeat') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    } else if (name === 'startTime' || name === 'endTime') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          [name]: value
        };
        // Automatically calculate duration when both times are set
        if (updatedData.startTime && updatedData.endTime) {
          const duration = calculateDuration(updatedData.startTime, updatedData.endTime);
          if (duration) {
            updatedData.estimatedDuration = duration;
          }
        }
        return updatedData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };

  const selectLocation = (location, type) => {
    const formattedAddress = location.formatted;
    const { lat, lng } = location.geometry;
    const components = location.components;

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [type]: {
          ...prev[type],
          address: formattedAddress,
          latitude: lat,
          longitude: lng,
          city: components.city || components.town || components.village || '',
          area: components.suburb || components.neighbourhood || '',
          pincode: components.postcode || ''
        }
      };

      // Calculate distance if both locations are set
      if (type === 'startLocation' && prev.endLocation.latitude && prev.endLocation.longitude) {
        calculateAndUpdateDistance(lat, lng, prev.endLocation.latitude, prev.endLocation.longitude);
      } else if (type === 'endLocation' && prev.startLocation.latitude && prev.startLocation.longitude) {
        calculateAndUpdateDistance(prev.startLocation.latitude, prev.startLocation.longitude, lat, lng);
      }

      return newFormData;
    });

    setLocationSuggestions(prev => ({
      ...prev,
      [type === 'startLocation' ? 'start' : 'end']: []
    }));

    setShowSuggestions(prev => ({
      ...prev,
      [type === 'startLocation' ? 'start' : 'end']: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const tripData = {
        ...formData,
        startLocation: {
          ...formData.startLocation,
          latitude: Number(formData.startLocation.latitude),
          longitude: Number(formData.startLocation.longitude)
        },
        endLocation: {
          ...formData.endLocation,
          latitude: Number(formData.endLocation.latitude),
          longitude: Number(formData.endLocation.longitude)
        },
        availableSeats: Number(formData.availableSeats),
        pricePerSeat: Number(formData.pricePerSeat),
        estimatedDuration: Number(formData.estimatedDuration),
        estimatedDistance: Number(formData.estimatedDistance),
        vehicleId: formData.vehicleId,
        route: {
          waypoints: formData.route.waypoints.length > 0 ? formData.route.waypoints : [
            { lat: Number(formData.startLocation.latitude), lng: Number(formData.startLocation.longitude) },
            { lat: Number(formData.endLocation.latitude), lng: Number(formData.endLocation.longitude) }
          ]
        }
      };

      const result = await dispatch(createNewTrip(tripData)).unwrap();
      navigate(`/trips/${result.id}`);
    } catch (err) {
      setErrors({
        submit: err.message || 'Failed to create trip. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">Offer a Ride</h2>
            <p className="mt-2 text-sm text-gray-600">Fill in the details below to create your trip</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Location Details</h3>
              </div>

              {/* Start Location */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Start Location</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Search Location</label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        name="startLocation.address"
                        value={formData.startLocation.address}
                        onChange={handleChange}
                        onFocus={() => setShowSuggestions(prev => ({ ...prev, start: true }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter city, area, or address"
                      />
                      {loadingStates.start && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {showSuggestions.start && locationSuggestions.start.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md">
                          <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            {locationSuggestions.start.map((location, index) => (
                              <li
                                key={index}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                                onClick={() => selectLocation(location, 'startLocation')}
                              >
                                <div className="font-medium text-gray-900">{location.formatted}</div>
                                <div className="text-sm text-gray-500">
                                  {location.components.city || location.components.town || location.components.village}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="0.0000001"
                      name="startLocation.latitude"
                      value={formData.startLocation.latitude}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="37.7749"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="0.0000001"
                      name="startLocation.longitude"
                      value={formData.startLocation.longitude}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="-122.4194"
                    />
                  </div>
                </div>
              </div>

              {/* End Location */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h4 className="text-lg font-medium text-gray-900">End Location</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Search Location</label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        name="endLocation.address"
                        value={formData.endLocation.address}
                        onChange={handleChange}
                        onFocus={() => setShowSuggestions(prev => ({ ...prev, end: true }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter city, area, or address"
                      />
                      {loadingStates.end && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {showSuggestions.end && locationSuggestions.end.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md">
                          <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            {locationSuggestions.end.map((location, index) => (
                              <li
                                key={index}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                                onClick={() => selectLocation(location, 'endLocation')}
                              >
                                <div className="font-medium text-gray-900">{location.formatted}</div>
                                <div className="text-sm text-gray-500">
                                  {location.components.city || location.components.town || location.components.village}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="0.0000001"
                      name="endLocation.latitude"
                      value={formData.endLocation.latitude}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="37.3382"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="0.0000001"
                      name="endLocation.longitude"
                      value={formData.endLocation.longitude}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="-121.8863"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details Section */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Trip Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    min={formData.startTime || new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Seats</label>
                  <input
                    type="number"
                    name="availableSeats"
                    min="1"
                    max="10"
                    value={formData.availableSeats}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price Per Seat</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="pricePerSeat"
                      min="0"
                      step="0.01"
                      value={formData.pricePerSeat}
                      onChange={handleChange}
                      className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Duration (minutes)</label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    min="1"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Auto-calculated from start and end time"
                  />
                  {errors.estimatedDuration && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Distance (km)</label>
                  <input
                    type="number"
                    name="estimatedDistance"
                    min="0.1"
                    step="0.1"
                    value={formData.estimatedDistance}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Auto-calculated from locations"
                  />
                  {errors.estimatedDistance && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedDistance}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Preferences</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(formData.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <input
                      id={key}
                      name={key}
                      type="checkbox"
                      checked={value}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={key} className="ml-3 text-sm text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)} {key === 'airConditioner' ? 'available' : 'allowed'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle and Notes Section */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">Additional Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    disabled={vehiclesLoading}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.type}
                      </option>
                    ))}
                  </select>
                  {vehiclesLoading && (
                    <div className="mt-2 text-sm text-gray-500">Loading vehicles...</div>
                  )}
                  
                  {/* Vehicle Details */}
                  {formData.vehicleId && vehicles.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      {vehicles.map((vehicle) => {
                        if (vehicle.id === formData.vehicleId) {
                          return (
                            <div key={vehicle.id} className="space-y-3">
                              {/* Vehicle Images */}
                              <div className="flex space-x-2 overflow-x-auto">
                                {vehicle.images.map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="h-24 w-32 object-cover rounded-md"
                                  />
                                ))}
                              </div>
                              
                              {/* Basic Info */}
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Make:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.make}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Model:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.model}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Year:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.year}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Color:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.color}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Type:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.type}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Seats:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.seats}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Transmission:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.transmission}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">License Plate:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.licensePlate}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Daily Rate:</span>
                                  <span className="ml-1 text-gray-900">${vehicle.dailyRate}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Status:</span>
                                  <span className="ml-1 text-gray-900">{vehicle.availabilityStatus}</span>
                                </div>
                              </div>

                              {/* Features */}
                              <div>
                                <span className="text-gray-500 block">Features:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {vehicle.features.map((feature, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Location */}
                              <div>
                                <span className="text-gray-500 block">Location:</span>
                                <span className="text-gray-900 text-sm">{vehicle.location.address}</span>
                                <div className="text-xs text-gray-500 mt-1">
                                  Coordinates: {vehicle.location.latitude}, {vehicle.location.longitude}
                                </div>
                              </div>

                              {/* Documents */}
                              <div className="flex gap-4">
                                <a
                                  href={vehicle.documents.insurance}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                  View Insurance
                                </a>
                                <a
                                  href={vehicle.documents.registration}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                  View Registration
                                </a>
                              </div>

                              {/* Verification Status */}
                              <div className="flex items-center">
                                <span className="text-gray-500 text-sm">Verification Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  vehicle.verificationStatus === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {vehicle.verificationStatus}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Additional information about your trip"
                  />
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/trips')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Creating...' : 'Create Trip'}
              </button>
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{errors.submit}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;