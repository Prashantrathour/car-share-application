const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Review, User, Trip, Vehicle } = require('../models');

// Get all reviews (admin only)
const getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.findAll({
    include: [
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      },
      {
        model: User,
        as: 'targetUser',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      },
      {
        model: Trip,
        as: 'trip'
      },
      {
        model: Vehicle,
        as: 'vehicle'
      }
    ]
  });

  res.status(httpStatus.OK).json({
    status: 'success',
    data: reviews
  });
});

// Get reviews for a trip
const getTripReviews = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const reviews = await Review.findAll({
    where: { tripId },
    include: [
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }
    ]
  });

  res.status(httpStatus.OK).json({
    status: 'success',
    data: reviews
  });
});

// Get reviews for a vehicle
const getVehicleReviews = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const reviews = await Review.findAll({
    where: { vehicleId },
    include: [
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }
    ]
  });

  res.status(httpStatus.OK).json({
    status: 'success',
    data: reviews
  });
});

// Get reviews for a user
const getUserReviews = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const reviews = await Review.findAll({
    where: { targetUserId: userId },
    include: [
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      },
      {
        model: Trip,
        as: 'trip'
      }
    ]
  });

  res.status(httpStatus.OK).json({
    status: 'success',
    data: reviews
  });
});

// Create a review
const createReview = catchAsync(async (req, res) => {
  const { tripId, vehicleId, targetUserId, rating, comment, type, aspects } = req.body;
  const reviewerId = req.user.id;

  // Validate that the reviewer has permission to review
  if (tripId) {
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
    }
    if (trip.status !== 'completed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Can only review completed trips');
    }
  }

  const review = await Review.create({
    reviewerId,
    tripId,
    vehicleId,
    targetUserId,
    rating,
    comment,
    type,
    aspects,
    status: 'pending'
  });

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: review
  });
});

// Update a review
const updateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment, aspects } = req.body;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Only allow reviewer or admin to update
  if (review.reviewerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this review');
  }

  // Update review
  review.rating = rating;
  review.comment = comment;
  review.aspects = aspects;
  review.isEdited = true;
  review.editHistory.push({
    timestamp: new Date(),
    userId: req.user.id,
    changes: { rating, comment, aspects }
  });

  await review.save();

  res.status(httpStatus.OK).json({
    status: 'success',
    data: review
  });
});

// Delete a review
const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Only allow reviewer or admin to delete
  if (review.reviewerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete this review');
  }

  await review.destroy();

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Review deleted successfully'
  });
});

// Report a review
const reportReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { reason } = req.body;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  review.status = 'reported';
  review.reportReason = reason;
  await review.save();

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Review reported successfully'
  });
});

// Get review statistics for a user
const getUserReviewStats = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const reviews = await Review.findAll({
    where: { targetUserId: userId }
  });

  const stats = {
    totalReviews: reviews.length,
    averageRating: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    aspectAverages: {}
  };

  if (reviews.length > 0) {
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    stats.averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    reviews.forEach(review => {
      stats.ratingDistribution[review.rating]++;
    });

    // Calculate aspect averages
    const aspects = {};
    reviews.forEach(review => {
      Object.entries(review.aspects || {}).forEach(([aspect, rating]) => {
        if (!aspects[aspect]) {
          aspects[aspect] = { sum: 0, count: 0 };
        }
        aspects[aspect].sum += rating;
        aspects[aspect].count++;
      });
    });

    Object.entries(aspects).forEach(([aspect, data]) => {
      stats.aspectAverages[aspect] = data.sum / data.count;
    });
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    data: stats
  });
});

// Get review statistics for a vehicle
const getVehicleReviewStats = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;

  const reviews = await Review.findAll({
    where: { vehicleId }
  });

  const stats = {
    totalReviews: reviews.length,
    averageRating: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    aspectAverages: {}
  };

  if (reviews.length > 0) {
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    stats.averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    reviews.forEach(review => {
      stats.ratingDistribution[review.rating]++;
    });

    // Calculate aspect averages
    const aspects = {};
    reviews.forEach(review => {
      Object.entries(review.aspects || {}).forEach(([aspect, rating]) => {
        if (!aspects[aspect]) {
          aspects[aspect] = { sum: 0, count: 0 };
        }
        aspects[aspect].sum += rating;
        aspects[aspect].count++;
      });
    });

    Object.entries(aspects).forEach(([aspect, data]) => {
      stats.aspectAverages[aspect] = data.sum / data.count;
    });
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    data: stats
  });
});

module.exports = {
  getAllReviews,
  getTripReviews,
  getVehicleReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  reportReview,
  getUserReviewStats,
  getVehicleReviewStats
}; 