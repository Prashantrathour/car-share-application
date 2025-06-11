const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Bookings',
        key: 'id'
      }
    },
    payerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'completed',
        'failed',
        'refunded',
        'cancelled'
      ),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'External payment provider reference ID'
    },
    transactionFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    billingDetails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['bookingId']
      },
      {
        fields: ['payerId']
      },
      {
        fields: ['receiverId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentIntentId'],
        unique: true,
        where: {
          paymentIntentId: {
            [Op.ne]: null
          }
        }
      }
    ]
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
    Payment.belongsTo(models.User, {
      foreignKey: 'payerId',
      as: 'payer'
    });
    Payment.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver'
    });
  };

  return Payment;
}; 