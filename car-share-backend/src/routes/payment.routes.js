const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const paymentController = require('../controllers/payment.controller');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/create-payment-intent',
  auth(),
  validate([
    body('booking_id').notEmpty().withMessage('Booking ID is required'),
  ]),
  paymentController.createPaymentIntent
);

router.post(
  '/confirm-payment',
  auth(),
  validate([
    body('payment_intent_id').notEmpty().withMessage('Payment intent ID is required'),
    body('booking_id').notEmpty().withMessage('Booking ID is required'),
  ]),
  paymentController.confirmPayment
);

// Stripe webhook - no auth needed as it comes from Stripe
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;