'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vehicles = [
      {
        id: uuidv4(),
        ownerId: global.seededUsers.driverIds[0],
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'ABC123',
        color: 'Silver',
        type: 'sedan',
        seats: 4,
        transmission: 'automatic',
        features: JSON.stringify([
          'Air Conditioning',
          'Bluetooth',
          'Backup Camera',
          'USB Charging'
        ]),
        availabilityStatus: 'available',
        dailyRate: 45.00,
        location: JSON.stringify({
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St, San Francisco, CA 94105'
        }),
        images: JSON.stringify([
          'toyota-camry-front.jpg',
          'toyota-camry-back.jpg',
          'toyota-camry-interior.jpg'
        ]),
        documents: JSON.stringify({
          insurance: 'insurance-doc.pdf',
          registration: 'registration-doc.pdf'
        }),
        verificationStatus: 'verified',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        ownerId: global.seededUsers.driverIds[1],
        make: 'Honda',
        model: 'CR-V',
        year: 2023,
        licensePlate: 'XYZ789',
        color: 'Blue',
        type: 'suv',
        seats: 5,
        transmission: 'automatic',
        features: JSON.stringify([
          'Air Conditioning',
          'Bluetooth',
          'Navigation',
          'Sunroof',
          'USB Charging',
          'Apple CarPlay'
        ]),
        availabilityStatus: 'available',
        dailyRate: 65.00,
        location: JSON.stringify({
          latitude: 37.7833,
          longitude: -122.4167,
          address: '456 Market St, San Francisco, CA 94105'
        }),
        images: JSON.stringify([
          'honda-crv-front.jpg',
          'honda-crv-back.jpg',
          'honda-crv-interior.jpg'
        ]),
        documents: JSON.stringify({
          insurance: 'insurance-doc.pdf',
          registration: 'registration-doc.pdf'
        }),
        verificationStatus: 'verified',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        ownerId: global.seededUsers.driverIds[0],
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'TESLA1',
        color: 'White',
        type: 'luxury',
        seats: 4,
        transmission: 'automatic',
        features: JSON.stringify([
          'Autopilot',
          'Premium Sound System',
          'Glass Roof',
          'Heated Seats',
          'Supercharging'
        ]),
        availabilityStatus: 'available',
        dailyRate: 85.00,
        location: JSON.stringify({
          latitude: 37.7858,
          longitude: -122.4064,
          address: '789 Battery St, San Francisco, CA 94111'
        }),
        images: JSON.stringify([
          'tesla-model3-front.jpg',
          'tesla-model3-back.jpg',
          'tesla-model3-interior.jpg'
        ]),
        documents: JSON.stringify({
          insurance: 'insurance-doc.pdf',
          registration: 'registration-doc.pdf'
        }),
        verificationStatus: 'verified',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Vehicles', vehicles, {});

    // Store vehicle IDs for reference in other seeders
    global.seededVehicles = vehicles.map(vehicle => vehicle.id);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Vehicles', null, {});
  }
}; 