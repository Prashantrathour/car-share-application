const { body } = require('express-validator');

const createPaymentIntent = [
  body('bookingId')
    .isUUID()
    .withMessage('Invalid booking ID format'),
];

const confirmPayment = [
  body('paymentIntentId')
    .isString()
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('bookingId')
    .isUUID()
    .withMessage('Invalid booking ID format'),
];

module.exports = {
  createPaymentIntent,
  confirmPayment,
};