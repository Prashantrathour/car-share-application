'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = {
      id: uuidv4(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@carsharing.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      status: 'active',
      preferences: JSON.stringify({
        language: 'en',
        currency: 'USD',
        notifications: {
          email: true,
          push: true,
          sms: true
        }
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const demoDrivers = [
      {
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Driver',
        email: 'john.driver@example.com',
        password: await bcrypt.hash('Driver@123', 10),
        phoneNumber: '+1234567891',
        dateOfBirth: '1992-03-15',
        role: 'driver',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        driverLicense: JSON.stringify({
          number: 'DL123456',
          expiryDate: '2025-12-31',
          state: 'CA',
          verified: true
        }),
        rating: 4.5,
        completedTrips: 150,
        totalEarnings: 4500.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Sarah',
        lastName: 'Driver',
        email: 'sarah.driver@example.com',
        password: await bcrypt.hash('Driver@123', 10),
        phoneNumber: '+1234567892',
        dateOfBirth: '1994-07-20',
        role: 'driver',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        driverLicense: JSON.stringify({
          number: 'DL789012',
          expiryDate: '2026-06-30',
          state: 'NY',
          verified: true
        }),
        rating: 4.8,
        completedTrips: 200,
        totalEarnings: 6000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const demoUsers = [
      {
        id: uuidv4(),
        firstName: 'Alice',
        lastName: 'User',
        email: 'alice@example.com',
        password: await bcrypt.hash('User@123', 10),
        phoneNumber: '+1234567893',
        dateOfBirth: '1995-05-10',
        role: 'user',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Bob',
        lastName: 'User',
        email: 'bob@example.com',
        password: await bcrypt.hash('User@123', 10),
        phoneNumber: '+1234567894',
        dateOfBirth: '1993-09-25',
        role: 'user',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', [adminUser, ...demoDrivers, ...demoUsers], {});

    // Store the user IDs for reference in other seeders
    global.seededUsers = {
      adminId: adminUser.id,
      driverIds: demoDrivers.map(driver => driver.id),
      userIds: demoUsers.map(user => user.id)
    };
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 