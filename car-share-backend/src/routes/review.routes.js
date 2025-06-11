const express = require('express');
const { body, param } = require('express-validator');
const { auth, authorize } = require('../middlewares/auth');
const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate');

const router = express.Router();

// Get all reviews (admin only)
router.get(
  '/all',
  auth(),
  authorize('admin'),
  reviewController.getAllReviews
);

// Get reviews for a trip
router.get(
  '/trip/:tripId',
  validate([
    param('tripId').isInt().withMessage('Trip ID must be an integer'),
  ]),
  reviewController.getTripReviews
);

// Get reviews for a vehicle
router.get(
  '/vehicle/:vehicleId',
  auth(),
  validate([
    param('vehicleId').isInt().withMessage('Vehicle ID must be an integer'),
  ]),
  reviewController.getVehicleReviews
);

// Get reviews for a user (as driver or passenger)
router.get(
  '/user/:userId',
  validate([
    param('userId').isInt().withMessage('User ID must be an integer'),
  ]),
  reviewController.getUserReviews
);

// Create a review
router.post(
  '/',
  auth(),
  validate([
    body('tripId').isInt().withMessage('Trip ID must be an integer'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  ]),
  reviewController.createReview
);

// Update a review
router.patch(
  '/:reviewId',
  auth(),
  validate([
    param('reviewId').isInt().withMessage('Review ID must be an integer'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  ]),
  reviewController.updateReview
);

// Delete a review
router.delete(
  '/:reviewId',
  auth(),
  validate([
    param('reviewId').isInt().withMessage('Review ID must be an integer'),
  ]),
  reviewController.deleteReview
);

// Report a review
router.post(
  '/:reviewId/report',
  auth(),
  validate([
    param('reviewId').isInt().withMessage('Review ID must be an integer'),
    body('reason').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Report reason must be between 1 and 500 characters'),
  ]),
  reviewController.reportReview
);

// Get review statistics for a user
router.get(
  '/stats/user/:userId',
  auth(),
  validate([
    param('userId').isInt().withMessage('User ID must be an integer'),
  ]),
  reviewController.getUserReviewStats
);

// Get review statistics for a vehicle
router.get(
  '/stats/vehicle/:vehicleId',
  auth(),
  validate([
    param('vehicleId').isInt().withMessage('Vehicle ID must be an integer'),
  ]),
  reviewController.getVehicleReviewStats
);

module.exports = router; 