'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const messages = [
      {
        id: uuidv4(),
        senderId: global.seededUsers.userIds[0],
        receiverId: global.seededUsers.driverIds[0],
        tripId: global.seededTrips[0],
        content: 'Hi, I\'m interested in joining your trip to San Jose tomorrow.',
        type: 'text',
        metadata: JSON.stringify({}),
        status: 'read',
        readAt: new Date(),
        deliveredAt: new Date(),
        isEdited: false,
        editHistory: JSON.stringify([]),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        senderId: global.seededUsers.driverIds[0],
        receiverId: global.seededUsers.userIds[0],
        tripId: global.seededTrips[0],
        content: 'Hello! Yes, I have 3 seats available. Where would you like to be picked up?',
        type: 'text',
        metadata: JSON.stringify({}),
        status: 'read',
        readAt: new Date(),
        deliveredAt: new Date(),
        isEdited: false,
        editHistory: JSON.stringify([]),
        createdAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        senderId: global.seededUsers.userIds[0],
        receiverId: global.seededUsers.driverIds[0],
        tripId: global.seededTrips[0],
        content: 'I\'ll be at 123 Main St, San Francisco.',
        type: 'text',
        metadata: JSON.stringify({}),
        status: 'read',
        readAt: new Date(),
        deliveredAt: new Date(),
        isEdited: false,
        editHistory: JSON.stringify([]),
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        senderId: global.seededUsers.userIds[0],
        receiverId: global.seededUsers.driverIds[0],
        tripId: global.seededTrips[0],
        type: 'location',
        content: 'Shared pickup location',
        metadata: JSON.stringify({
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St, San Francisco, CA 94105'
        }),
        status: 'read',
        readAt: new Date(),
        deliveredAt: new Date(),
        isEdited: false,
        editHistory: JSON.stringify([]),
        createdAt: new Date(Date.now() - 1.4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1.4 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('Messages', messages, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Messages', null, {});
  }
}; 