const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Trips',
        key: 'id'
      }
    },
    passengerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    numberOfSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    pickupLocation: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasCoordinates(value) {
          if (!value.latitude || !value.longitude || !value.address) {
            throw new Error('Pickup location must include latitude, longitude, and address');
          }
        }
      }
    },
    dropoffLocation: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasCoordinates(value) {
          if (!value.latitude || !value.longitude || !value.address) {
            throw new Error('Dropoff location must include latitude, longitude, and address');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM(
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'authorized', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancellationTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passengerNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    driverNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    baggageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    specialRequests: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    pickupCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: 'Verification code for pickup'
    },
    actualPickupTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualDropoffTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isReviewedByPassenger: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isReviewedByDriver: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['tripId']
      },
      {
        fields: ['passengerId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentStatus']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
    Booking.belongsTo(models.User, {
      foreignKey: 'passengerId',
      as: 'passenger'
    });
    Booking.hasMany(models.Payment, {
      foreignKey: 'bookingId',
      as: 'payments'
    });
    Booking.hasMany(models.Review, {
      foreignKey: 'bookingId',
      as: 'reviews'
    });
  };

  return Booking;
}; 