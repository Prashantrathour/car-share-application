const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Trips',
        key: 'id'
      }
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Vehicles',
        key: 'id'
      }
    },
    targetUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('trip', 'vehicle', 'driver', 'passenger'),
      allowNull: false
    },
    aspects: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Specific ratings for different aspects (cleanliness, punctuality, etc.)'
    },
    status: {
      type: DataTypes.ENUM('pending', 'published', 'reported', 'removed'),
      defaultValue: 'pending'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reportReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    validate: {
      validateReviewTarget() {
        const targets = [this.tripId, this.vehicleId, this.targetUserId].filter(Boolean);
        if (targets.length !== 1) {
          throw new Error('Review must have exactly one target (trip, vehicle, or user)');
        }
        
        if (this.type === 'trip' && !this.tripId) {
          throw new Error('Trip review must have a tripId');
        }
        if (this.type === 'vehicle' && !this.vehicleId) {
          throw new Error('Vehicle review must have a vehicleId');
        }
        if ((this.type === 'driver' || this.type === 'passenger') && !this.targetUserId) {
          throw new Error('User review must have a targetUserId');
        }
      }
    }
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, {
      foreignKey: 'reviewerId',
      as: 'reviewer'
    });
    Review.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
    Review.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
    Review.belongsTo(models.User, {
      foreignKey: 'targetUserId',
      as: 'targetUser'
    });
  };

  return Review;
}; 