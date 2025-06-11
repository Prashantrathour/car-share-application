const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const bookingController = require('../controllers/booking.controller');
const { auth, authorize } = require('../middlewares/auth');
const bookingValidation = require('../validations/booking.validation');

const router = express.Router();

router.get(
  '/',
  auth(),
  bookingController.getBookings
);

router.get(
  '/:id',
  auth(),
  bookingController.getBooking
);

router.post(
  '/',
  auth(),
  authorize('user', 'admin'),
  validate([
    body('tripId').notEmpty().withMessage('Trip ID is required'),
    body('numberOfSeats').isInt({ min: 1 }).withMessage('Must be a positive integer'),
  ]),
  bookingController.createBooking
);

router.patch(
  '/:id',
  auth(),
  authorize('user', 'driver', 'admin'),
  validate([
    body('pickupLocation').optional(),
    body('dropoffLocation').optional(),
    body('passengerNotes').optional(),
    body('baggageCount').optional().isInt({ min: 0 }),
    body('specialRequests').optional().isArray(),
  ]),
  bookingController.updateBooking
);

router.patch(
  '/:id/cancel',
  auth(),
  validate([
    body('cancellationReason').optional(),
  ]),
  bookingController.cancelBooking
);

router
  .route('/:id/rate')
  .post(auth(), validate(bookingValidation.rateBooking), bookingController.rateBooking);

router
  .route('/:id/confirm')
  .post(auth(), validate(bookingValidation.confirmBooking), bookingController.confirmBooking);

router
  .route('/:id/complete')
  .post(auth(), bookingController.completeBooking);

module.exports = router;