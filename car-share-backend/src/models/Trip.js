const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Vehicles',
        key: 'id'
      }
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    startLocation: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasCoordinates(value) {
          if (!value.latitude || !value.longitude || !value.address) {
            throw new Error('Start location must include latitude, longitude, and address');
          }
        }
      }
    },
    endLocation: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasCoordinates(value) {
          if (!value.latitude || !value.longitude || !value.address) {
            throw new Error('End location must include latitude, longitude, and address');
          }
        }
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStartTime(value) {
          if (value <= this.startTime) {
            throw new Error('End time must be after start time');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    pricePerSeat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    route: {
      type: DataTypes.JSON,
      allowNull: true
    },
    estimatedDuration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false
    },
    estimatedDistance: {
      type: DataTypes.DECIMAL(10, 2), // in kilometers
      allowNull: false
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true // Soft deletes
  });

  Trip.associate = (models) => {
    Trip.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
    Trip.belongsTo(models.User, {
      foreignKey: 'driverId',
      as: 'driver'
    });
    Trip.hasMany(models.Booking, {
      foreignKey: 'tripId',
      as: 'bookings'
    });
    Trip.hasMany(models.Review, {
      foreignKey: 'tripId',
      as: 'reviews'
    });
  };

  return Trip;
}; 