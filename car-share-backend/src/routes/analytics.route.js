const express = require('express');

const analyticsController = require('../controllers/analytics.controller');
const validate = require('../middlewares/validate');
const analyticsValidation = require('../validations/analytics.validation');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/platform')
  .get(auth('getAnalytics'), analyticsController.getPlatformStats);

router
  .route('/trips')
  .get(
    auth('getAnalytics'), 
    validate(analyticsValidation.getTripStats),
    analyticsController.getTripStats
  );

router
  .route('/user-growth')
  .get(
    auth('getAnalytics'), 
    validate(analyticsValidation.getUserGrowthStats),
    analyticsController.getUserGrowthStats
  );

router
  .route('/revenue')
  .get(
    auth('getAnalytics'), 
    validate(analyticsValidation.getRevenueStats),
    analyticsController.getRevenueStats
  );

router
  .route('/top-drivers')
  .get(
    auth('getAnalytics'), 
    validate(analyticsValidation.getTopDrivers),
    analyticsController.getTopDrivers
  );

router
  .route('/popular-routes')
  .get(
    auth('getAnalytics'), 
    validate(analyticsValidation.getPopularRoutes),
    analyticsController.getPopularRoutes
  );

module.exports = router; 