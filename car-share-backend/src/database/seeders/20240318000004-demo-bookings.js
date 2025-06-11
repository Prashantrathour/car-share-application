'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bookings = [
      {
        id: uuidv4(),
        tripId: global.seededTrips[0],
        passengerId: global.seededUsers.userIds[0],
        numberOfSeats: 2,
        pickupLocation: JSON.stringify({
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St, San Francisco, CA 94105'
        }),
        dropoffLocation: JSON.stringify({
          latitude: 37.3382,
          longitude: -121.8863,
          address: '456 First St, San Jose, CA 95113'
        }),
        status: 'confirmed',
        totalPrice: 50.00,
        paymentStatus: 'paid',
        paymentIntentId: 'pi_' + uuidv4().replace(/-/g, ''),
        passengerNotes: 'I have two medium-sized bags',
        baggageCount: 2,
        specialRequests: JSON.stringify(['wheelchair_accessible', 'quiet_preferred']),
        pickupCode: '123456',
        isReviewedByPassenger: false,
        isReviewedByDriver: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        tripId: global.seededTrips[1],
        passengerId: global.seededUsers.userIds[1],
        numberOfSeats: 1,
        pickupLocation: JSON.stringify({
          latitude: 37.7833,
          longitude: -122.4167,
          address: '456 Market St, San Francisco, CA 94105'
        }),
        dropoffLocation: JSON.stringify({
          latitude: 38.5816,
          longitude: -121.4944,
          address: '789 Capitol Mall, Sacramento, CA 95814'
        }),
        status: 'confirmed',
        totalPrice: 35.00,
        paymentStatus: 'paid',
        paymentIntentId: 'pi_' + uuidv4().replace(/-/g, ''),
        passengerNotes: 'I have a small dog with me',
        baggageCount: 1,
        specialRequests: JSON.stringify(['pet_friendly', 'temperature_control']),
        pickupCode: '789012',
        isReviewedByPassenger: false,
        isReviewedByDriver: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Bookings', bookings, {});

    // Store booking IDs for reference in other seeders
    global.seededBookings = bookings.map(booking => booking.id);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bookings', null, {});
  }
}; 