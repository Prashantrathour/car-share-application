/**
 * Get nearby carpooling options
 * @param {Object} params - Search parameters
 * @returns {Promise<Trip[]>}
 */
const findCarpoolOptions = async (params) => {
  const {
    startLocation,
    endLocation,
    startTime,
    endTime,
    radius = 5, // default 5km radius
    limit = 10
  } = params;

  // Calculate bounding box around the start and end locations for initial filtering
  const startLatitude = parseFloat(startLocation.latitude);
  const startLongitude = parseFloat(startLocation.longitude);
  const endLatitude = parseFloat(endLocation.latitude);
  const endLongitude = parseFloat(endLocation.longitude);

  // Convert radius from km to approximate degrees
  // This is a simplified approach that works for small distances
  const latRadiusInDegrees = radius / 111; // 111km per degree of latitude
  const longRadiusInDegrees = radius / (111 * Math.cos(startLatitude * Math.PI / 180));

  // Find trips that match the time frame and have available seats
  const trips = await Trip.findAll({
    where: {
      status: 'scheduled',
      availableSeats: { [Op.gt]: 0 },
      startTime: { 
        [Op.between]: [
          new Date(startTime).setHours(new Date(startTime).getHours() - 2), // 2 hours before
          new Date(startTime).setHours(new Date(startTime).getHours() + 2)  // 2 hours after
        ] 
      }
    },
    include: [
      {
        model: User,
        as: 'driver',
        attributes: ['id', 'firstName', 'lastName', 'rating']
      },
      {
        model: Vehicle,
        attributes: ['id', 'make', 'model', 'year', 'color', 'type', 'seats']
      }
    ],
    limit: parseInt(limit, 10)
  });

  // Calculate distance from each trip's start and end points to user's start and end
  const carpoolOptions = trips.filter(trip => {
    const tripStartLat = parseFloat(trip.startLocation.latitude);
    const tripStartLong = parseFloat(trip.startLocation.longitude);
    const tripEndLat = parseFloat(trip.endLocation.latitude);
    const tripEndLong = parseFloat(trip.endLocation.longitude);

    // Check if the trip's start location is within the radius of user's start location
    const startDistanceWithinRadius = 
      Math.abs(tripStartLat - startLatitude) <= latRadiusInDegrees &&
      Math.abs(tripStartLong - startLongitude) <= longRadiusInDegrees;

    // Check if the trip's end location is within the radius of user's end location
    const endDistanceWithinRadius = 
      Math.abs(tripEndLat - endLatitude) <= latRadiusInDegrees &&
      Math.abs(tripEndLong - endLongitude) <= longRadiusInDegrees;
      
    // Calculate actual distance using Haversine formula
    const startDistance = calculateDistance(
      startLatitude, startLongitude,
      tripStartLat, tripStartLong
    );
    
    const endDistance = calculateDistance(
      endLatitude, endLongitude,
      tripEndLat, tripEndLong
    );

    // Add distance data to the trip object
    trip.dataValues.startDistanceKm = startDistance;
    trip.dataValues.endDistanceKm = endDistance;
    
    // Return true if both start and end are within acceptable radius
    return startDistance <= radius && endDistance <= radius;
  });

  return carpoolOptions;
};

/**
 * Add a waypoint to an existing trip (for carpooling)
 * @param {string} tripId - Trip ID
 * @param {Object} waypoint - Waypoint details
 * @returns {Promise<Trip>}
 */
const addWaypoint = async (tripId, waypoint) => {
  const trip = await Trip.findByPk(tripId);
  
  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
  }
  
  if (trip.status !== 'scheduled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Waypoints can only be added to scheduled trips');
  }
  
  // Initialize route if it doesn't exist
  if (!trip.route) {
    trip.route = { waypoints: [] };
  }
  
  // Add the new waypoint with timestamp and type
  const updatedWaypoints = [...(trip.route.waypoints || []), {
    ...waypoint,
    timestamp: new Date().toISOString(),
    type: waypoint.type || 'pickup' // can be 'pickup' or 'dropoff'
  }];
  
  // Sort waypoints by order/sequence if provided
  if (updatedWaypoints.some(wp => wp.sequence !== undefined)) {
    updatedWaypoints.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }
  
  // Update the trip with new waypoints
  const updatedTrip = await trip.update({
    route: {
      ...trip.route,
      waypoints: updatedWaypoints
    }
  });
  
  return updatedTrip;
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Calculate estimated arrival time for each waypoint
 * @param {string} tripId - Trip ID
 * @returns {Promise<Object>}
 */
const calculateWaypointETAs = async (tripId) => {
  const trip = await Trip.findByPk(tripId);
  
  if (!trip || !trip.route || !trip.route.waypoints) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip or waypoints not found');
  }
  
  const { startTime, estimatedDuration, route } = trip;
  const waypoints = route.waypoints;
  
  // Calculate the total trip distance
  const totalDistance = estimatedDuration / 60; // Convert minutes to hours for simplification
  
  // If waypoints have distances, use them for more accurate ETA
  if (waypoints.every(wp => wp.distanceFromStart !== undefined)) {
    const tripStartTime = new Date(startTime);
    
    // Calculate ETAs based on distance proportion
    const waypointsWithETA = waypoints.map(waypoint => {
      const distanceRatio = waypoint.distanceFromStart / totalDistance;
      const estimatedTimeMinutes = estimatedDuration * distanceRatio;
      
      const estimatedArrivalTime = new Date(tripStartTime);
      estimatedArrivalTime.setMinutes(tripStartTime.getMinutes() + estimatedTimeMinutes);
      
      return {
        ...waypoint,
        estimatedArrivalTime: estimatedArrivalTime.toISOString()
      };
    });
    
    return {
      ...trip.toJSON(),
      route: {
        ...trip.route,
        waypoints: waypointsWithETA
      }
    };
  }
  
  // Fallback: evenly distribute waypoints if no distances provided
  const tripStartTime = new Date(startTime);
  const timePerWaypoint = estimatedDuration / (waypoints.length + 1);
  
  const waypointsWithETA = waypoints.map((waypoint, index) => {
    const estimatedTimeMinutes = timePerWaypoint * (index + 1);
    
    const estimatedArrivalTime = new Date(tripStartTime);
    estimatedArrivalTime.setMinutes(tripStartTime.getMinutes() + estimatedTimeMinutes);
    
    return {
      ...waypoint,
      estimatedArrivalTime: estimatedArrivalTime.toISOString()
    };
  });
  
  return {
    ...trip.toJSON(),
    route: {
      ...trip.route,
      waypoints: waypointsWithETA
    }
  };
};

// Add these new functions to the exports
module.exports = {
  // ... existing exports ...
  findCarpoolOptions,
  addWaypoint,
  calculateWaypointETAs
}; 