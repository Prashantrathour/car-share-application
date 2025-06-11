'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const reviews = [
      {
        id: uuidv4(),
        reviewerId: global.seededUsers.userIds[0],
        tripId: global.seededTrips[0],
        vehicleId: global.seededVehicles[0],
        targetUserId: global.seededUsers.driverIds[0],
        rating: 5,
        comment: 'Excellent driver, very professional and punctual. The car was clean and comfortable.',
        type: 'driver',
        aspects: JSON.stringify({
          punctuality: 5,
          cleanliness: 5,
          communication: 5,
          driving_skill: 5
        }),
        status: 'published',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        reviewerId: global.seededUsers.driverIds[0],
        tripId: global.seededTrips[0],
        targetUserId: global.seededUsers.userIds[0],
        rating: 4,
        comment: 'Great passenger, very respectful and on time.',
        type: 'passenger',
        aspects: JSON.stringify({
          punctuality: 4,
          communication: 5,
          behavior: 4,
          cleanliness: 4
        }),
        status: 'published',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        reviewerId: global.seededUsers.userIds[1],
        vehicleId: global.seededVehicles[1],
        rating: 5,
        comment: 'Very comfortable and clean vehicle. All features worked perfectly.',
        type: 'vehicle',
        aspects: JSON.stringify({
          comfort: 5,
          cleanliness: 5,
          maintenance: 5,
          features: 5
        }),
        status: 'published',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Reviews', reviews, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Reviews', null, {});
  }
}; 