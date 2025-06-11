'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const payments = [
      {
        id: uuidv4(),
        bookingId: global.seededBookings[0],
        payerId: global.seededUsers.userIds[0],
        receiverId: global.seededUsers.driverIds[0],
        amount: 50.00,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentIntentId: 'pi_' + uuidv4().replace(/-/g, ''),
        transactionFee: 1.50,
        platformFee: 5.00,
        metadata: JSON.stringify({
          card_brand: 'visa',
          last4: '4242'
        }),
        billingDetails: JSON.stringify({
          name: 'Alice User',
          email: 'alice@example.com',
          phone: '+1234567893'
        }),
        receiptUrl: 'https://stripe.com/receipts/' + uuidv4(),
        notes: 'Payment for SF to San Jose trip',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        bookingId: global.seededBookings[1],
        payerId: global.seededUsers.userIds[1],
        receiverId: global.seededUsers.driverIds[1],
        amount: 35.00,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentIntentId: 'pi_' + uuidv4().replace(/-/g, ''),
        transactionFee: 1.05,
        platformFee: 3.50,
        metadata: JSON.stringify({
          card_brand: 'mastercard',
          last4: '5555'
        }),
        billingDetails: JSON.stringify({
          name: 'Bob User',
          email: 'bob@example.com',
          phone: '+1234567894'
        }),
        receiptUrl: 'https://stripe.com/receipts/' + uuidv4(),
        notes: 'Payment for SF to Sacramento trip',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Payments', payments, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Payments', null, {});
  }
}; 