const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    senderId: {
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
    tripId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Trips',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'location', 'system'),
      defaultValue: 'text'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional data for specific message types (image URL, location coordinates, etc.)'
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      defaultValue: 'sent'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    editHistory: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    replyToId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['senderId', 'receiverId']
      },
      {
        fields: ['tripId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver'
    });
    Message.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
    Message.belongsTo(Message, {
      foreignKey: 'replyToId',
      as: 'replyTo'
    });
    Message.hasMany(Message, {
      foreignKey: 'replyToId',
      as: 'replies'
    });
  };

  return Message;
}; 