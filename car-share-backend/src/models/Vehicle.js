const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 1
      }
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('sedan', 'suv', 'van', 'truck', 'luxury'),
      allowNull: false
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2,
        max: 15
      }
    },
    transmission: {
      type: DataTypes.ENUM('automatic', 'manual'),
      allowNull: false
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    availabilityStatus: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'inactive'),
      defaultValue: 'available'
    },
    dailyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    location: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        hasCoordinates(value) {
          if (!value.latitude || !value.longitude) {
            throw new Error('Location must include latitude and longitude');
          }
        }
      }
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    documents: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true,
    paranoid: true // Soft deletes
  });

  Vehicle.associate = (models) => {
    Vehicle.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    Vehicle.hasMany(models.Trip, {
      foreignKey: 'vehicleId',
      as: 'trips'
    });
    Vehicle.hasMany(models.Review, {
      foreignKey: 'vehicleId',
      as: 'reviews'
    });
  };

  return Vehicle;
}; 