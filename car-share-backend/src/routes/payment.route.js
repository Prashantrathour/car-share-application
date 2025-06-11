const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { auth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const paymentValidation = require('../validations/payment.validation');

const router = express.Router();

router
  .route('/create-intent')
  .post(
    auth(),
    validate(paymentValidation.createPaymentIntent),
    paymentController.createPaymentIntent
  );

router
  .route('/confirm')
  .post(
    auth(),
    validate(paymentValidation.confirmPayment),
    paymentController.confirmPayment
  );

// Stripe webhook endpoint - no auth required
router
  .route('/webhook')
  .post(
    express.raw({ type: 'application/json' }), // Required for Stripe webhook signature verification
    paymentController.handleWebhook
  );

module.exports = router; 