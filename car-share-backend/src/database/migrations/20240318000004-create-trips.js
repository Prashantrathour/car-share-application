'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'id'
        }
      },
      driverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      startLocation: {
        type: Sequelize.JSON,
        allowNull: false
      },
      endLocation: {
        type: Sequelize.JSON,
        allowNull: false
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
      },
      availableSeats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      pricePerSeat: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      route: {
        type: Sequelize.JSON,
        allowNull: true
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estimatedDistance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      preferences: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('Trips', ['vehicleId']);
    await queryInterface.addIndex('Trips', ['driverId']);
    await queryInterface.addIndex('Trips', ['status']);
    await queryInterface.addIndex('Trips', ['startTime']);
    await queryInterface.addIndex('Trips', ['endTime']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Trips');
  }
}; 