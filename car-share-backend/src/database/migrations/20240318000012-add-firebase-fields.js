'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add Firebase UID column if it doesn't exist
      await queryInterface.addColumn(
        'Users',
        'firebaseUid',
        {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Firebase User ID for authentication and verification'
        },
        { transaction }
      );

      // Add email verification token if it doesn't exist
      await queryInterface.addColumn(
        'Users',
        'emailVerificationToken',
        {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Token for email verification (used in non-Firebase verification)'
        },
        { transaction }
      );

      // Add phone verification code if it doesn't exist
      await queryInterface.addColumn(
        'Users',
        'phoneVerificationCode',
        {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Code for phone verification (used in non-Firebase verification)'
        },
        { transaction }
      );

      // Add phone verification expiration if it doesn't exist
      await queryInterface.addColumn(
        'Users',
        'phoneVerificationExpires',
        {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Expiration time for phone verification code'
        },
        { transaction }
      );

      await transaction.commit();
      return Promise.resolve();
    } catch (error) {
      await transaction.rollback();
      // If columns already exist, that's fine
      if (error.message.includes('column already exists')) {
        return Promise.resolve();
      }
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove Firebase UID column
      await queryInterface.removeColumn(
        'Users',
        'firebaseUid',
        { transaction }
      );

      // Remove email verification token
      await queryInterface.removeColumn(
        'Users',
        'emailVerificationToken',
        { transaction }
      );

      // Remove phone verification code
      await queryInterface.removeColumn(
        'Users',
        'phoneVerificationCode',
        { transaction }
      );

      // Remove phone verification expiration
      await queryInterface.removeColumn(
        'Users',
        'phoneVerificationExpires',
        { transaction }
      );

      await transaction.commit();
      return Promise.resolve();
    } catch (error) {
      await transaction.rollback();
      return Promise.reject(error);
    }
  }
}; 