'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'driver', 'admin'),
        defaultValue: 'user'
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isPhoneVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'banned'),
        defaultValue: 'pending'
      },
      driverLicense: {
        type: Sequelize.JSON,
        allowNull: true
      },
      address: {
        type: Sequelize.JSON,
        allowNull: true
      },
      preferences: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      totalRatings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      completedTrips: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalEarnings: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripeConnectAccountId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      firebaseUid: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      phoneVerificationCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phoneVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create Vehicles table
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
        allowNull: false
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
        allowNull: false
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create Trips table
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
        allowNull: false
      },
      pricePerSeat: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create Bookings table
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
        allowNull: false
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
        allowNull: false
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
        defaultValue: 0
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Bookings');
    await queryInterface.dropTable('Trips');
    await queryInterface.dropTable('Vehicles');
    await queryInterface.dropTable('Users');
  }
}; 