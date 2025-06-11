'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const trips = [
      {
        id: uuidv4(),
        vehicleId: global.seededVehicles[0],
        driverId: global.seededUsers.driverIds[0],
        startLocation: JSON.stringify({
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St, San Francisco, CA 94105'
        }),
        endLocation: JSON.stringify({
          latitude: 37.3382,
          longitude: -121.8863,
          address: '456 First St, San Jose, CA 95113'
        }),
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
        status: 'scheduled',
        availableSeats: 3,
        pricePerSeat: 25.00,
        route: JSON.stringify({
          waypoints: [
            { lat: 37.7749, lng: -122.4194 },
            { lat: 37.5482, lng: -122.1504 },
            { lat: 37.3382, lng: -121.8863 }
          ]
        }),
        estimatedDuration: 60, // minutes
        estimatedDistance: 50.5, // miles
        preferences: JSON.stringify({
          smoking: false,
          music: true,
          pets: false
        }),
        notes: 'Direct route to San Jose, minimal stops',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        vehicleId: global.seededVehicles[1],
        driverId: global.seededUsers.driverIds[1],
        startLocation: JSON.stringify({
          latitude: 37.7833,
          longitude: -122.4167,
          address: '456 Market St, San Francisco, CA 94105'
        }),
        endLocation: JSON.stringify({
          latitude: 38.5816,
          longitude: -121.4944,
          address: '789 Capitol Mall, Sacramento, CA 95814'
        }),
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(Date.now() + 50 * 60 * 60 * 1000), // Day after tomorrow + 2 hours
        status: 'scheduled',
        availableSeats: 4,
        pricePerSeat: 35.00,
        route: JSON.stringify({
          waypoints: [
            { lat: 37.7833, lng: -122.4167 },
            { lat: 38.0834, lng: -122.1504 },
            { lat: 38.5816, lng: -121.4944 }
          ]
        }),
        estimatedDuration: 120, // minutes
        estimatedDistance: 88.0, // miles
        preferences: JSON.stringify({
          smoking: false,
          music: true,
          pets: true,
          luggage: 'medium'
        }),
        notes: 'Comfortable ride to Sacramento, one rest stop',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Trips', trips, {});

    // Store trip IDs for reference in other seeders
    global.seededTrips = trips.map(trip => trip.id);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Trips', null, {});
  }
}; 