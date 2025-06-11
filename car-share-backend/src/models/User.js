const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Vehicle associations
      this.hasMany(models.Vehicle, { foreignKey: 'ownerId', as: 'vehicles' });
      
      // Trip associations
      this.hasMany(models.Trip, { foreignKey: 'driverId', as: 'tripsAsDriver' });
      this.hasMany(models.Booking, { foreignKey: 'passengerId', as: 'bookingsAsPassenger' });
      
      // Review associations
      this.hasMany(models.Review, { foreignKey: 'reviewerId', as: 'givenReviews' });
      this.hasMany(models.Review, { foreignKey: 'targetUserId', as: 'receivedReviews' });
      
      // Payment associations
      this.hasMany(models.Payment, { foreignKey: 'payerId', as: 'paymentsMade' });
      this.hasMany(models.Payment, { foreignKey: 'receiverId', as: 'paymentsReceived' });
      
      // Message associations
      this.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
      this.hasMany(models.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
    }

    async isPasswordMatch(password) {
      return bcrypt.compare(password, this.password);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      values.name = `${values.firstName} ${values.lastName}`;
      return values;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 128]
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\+?[\d\s-]+$/
      }
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isBeforeToday(value) {
          if (value && new Date(value) >= new Date()) {
            throw new Error('Date of birth must be before today');
          }
        }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'driver', 'admin'),
      defaultValue: 'user'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'banned'),
      defaultValue: 'pending'
    },
    driverLicense: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Driver license details including number, expiry, and verification status'
    },
    address: {
      type: DataTypes.JSON,
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'User preferences like language, currency, notifications settings'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      }
    },
    totalRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    completedTrips: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripeConnectAccountId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Firebase authentication fields
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Firebase User ID for authentication and verification'
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Token for email verification (used in non-Firebase verification)'
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiration time for email verification token'
    },
    phoneVerificationCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Code for phone verification (used in non-Firebase verification)'
    },
    phoneVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiration time for phone verification code'
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    paranoid: true, // Soft deletes
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['phoneNumber']
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      }
    ]
  });

  User.prototype.isPasswordMatch = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
}; 