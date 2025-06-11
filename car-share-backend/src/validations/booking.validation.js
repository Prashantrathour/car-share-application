const { body } = require('express-validator');

const createBooking = [
  body('tripId').notEmpty().withMessage('Trip ID is required'),
  body('seats_booked').isInt({ min: 1 }).withMessage('Must be a positive integer'),
];

const cancelBooking = [
  body('cancellation_reason').optional(),
];

const rateBooking = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional(),
];

const confirmBooking = [
  body('action')
    .isIn(['confirm', 'reject'])
    .withMessage('Action must be either "confirm" or "reject"'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be a string with maximum length of 500 characters'),
];



module.exports = {
  createBooking,
  cancelBooking,
  rateBooking,
  confirmBooking,
 
};