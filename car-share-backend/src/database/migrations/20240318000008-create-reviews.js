'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      reviewerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      tripId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Trips',
          key: 'id'
        }
      },
      vehicleId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Vehicles',
          key: 'id'
        }
      },
      targetUserId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('trip', 'vehicle', 'driver', 'passenger'),
        allowNull: false
      },
      aspects: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('pending', 'published', 'reported', 'removed'),
        defaultValue: 'pending'
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      reportReason: {
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

    await queryInterface.addIndex('Reviews', ['reviewerId']);
    await queryInterface.addIndex('Reviews', ['tripId']);
    await queryInterface.addIndex('Reviews', ['vehicleId']);
    await queryInterface.addIndex('Reviews', ['targetUserId']);
    await queryInterface.addIndex('Reviews', ['type']);
    await queryInterface.addIndex('Reviews', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reviews');
  }
}; 