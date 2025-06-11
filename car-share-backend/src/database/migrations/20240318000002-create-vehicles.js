'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Vehicles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      make: {
        type: Sequelize.STRING,
        allowNull: false
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1900,
          max: new Date().getFullYear() + 1
        }
      },
      licensePlate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('sedan', 'suv', 'van', 'truck', 'luxury'),
        allowNull: false
      },
      seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 2,
          max: 15
        }
      },
      transmission: {
        type: Sequelize.ENUM('automatic', 'manual'),
        allowNull: false
      },
      features: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      availabilityStatus: {
        type: Sequelize.ENUM('available', 'in_use', 'maintenance', 'inactive'),
        defaultValue: 'available'
      },
      dailyRate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      location: {
        type: Sequelize.JSON,
        allowNull: false
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      documents: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('Vehicles', ['ownerId']);
    await queryInterface.addIndex('Vehicles', ['licensePlate'], { unique: true });
    await queryInterface.addIndex('Vehicles', ['type']);
    await queryInterface.addIndex('Vehicles', ['availabilityStatus']);
    await queryInterface.addIndex('Vehicles', ['verificationStatus']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Vehicles');
  }
}; 