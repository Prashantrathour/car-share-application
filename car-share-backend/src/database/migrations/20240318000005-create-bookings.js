'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tripId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Trips',
          key: 'id'
        }
      },
      passengerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      numberOfSeats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      pickupLocation: {
        type: Sequelize.JSON,
        allowNull: false
      },
      dropoffLocation: {
        type: Sequelize.JSON,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'confirmed',
          'in_progress',
          'completed',
          'cancelled_by_passenger',
          'cancelled_by_driver',
          'no_show'
        ),
        defaultValue: 'pending'
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'authorized', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      paymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cancellationReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancellationTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passengerNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      driverNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      baggageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      specialRequests: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      pickupCode: {
        type: Sequelize.STRING(6),
        allowNull: true
      },
      actualPickupTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actualDropoffTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isReviewedByPassenger: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isReviewedByDriver: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addIndex('Bookings', ['tripId']);
    await queryInterface.addIndex('Bookings', ['passengerId']);
    await queryInterface.addIndex('Bookings', ['status']);
    await queryInterface.addIndex('Bookings', ['paymentStatus']);
    await queryInterface.addIndex('Bookings', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Bookings');
  }
}; 