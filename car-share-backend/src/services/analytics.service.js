const { Op } = require('sequelize');
const httpStatus = require('http-status');
const { User, Trip, Booking, Payment, Vehicle, Review } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get platform overview statistics
 * @returns {Promise<Object>}
 */
const getPlatformStats = async () => {
  const [
    totalUsers,
    totalDrivers,
    totalTrips,
    totalBookings,
    totalVehicles,
    totalEarnings,
    completedTrips
  ] = await Promise.all([
    User.count({ where: { status: 'active' } }),
    User.count({ where: { role: 'driver', status: 'active' } }),
    Trip.count(),
    Booking.count(),
    Vehicle.count({ where: { status: 'active' } }),
    Payment.sum('amount', { where: { status: 'completed' } }),
    Trip.count({ where: { status: 'completed' } })
  ]);

  return {
    totalUsers,
    totalDrivers,
    totalTrips,
    totalBookings,
    totalVehicles,
    totalEarnings: totalEarnings || 0,
    completedTrips,
    conversionRate: totalBookings > 0 && totalTrips > 0 
      ? ((totalBookings / totalTrips) * 100).toFixed(2) 
      : 0
  };
};

/**
 * Get trip statistics by date range
 * @param {Object} filter - Date range filter
 * @returns {Promise<Object>}
 */
const getTripStats = async (filter) => {
  const { startDate, endDate } = filter;
  
  const whereClause = {};
  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const [
    totalTrips,
    scheduledTrips,
    inProgressTrips,
    completedTrips,
    cancelledTrips,
    averageRating
  ] = await Promise.all([
    Trip.count({ where: whereClause }),
    Trip.count({ where: { ...whereClause, status: 'scheduled' } }),
    Trip.count({ where: { ...whereClause, status: 'in_progress' } }),
    Trip.count({ where: { ...whereClause, status: 'completed' } }),
    Trip.count({ where: { ...whereClause, status: 'cancelled' } }),
    Review.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      raw: true
    })
  ]);

  return {
    totalTrips,
    scheduledTrips,
    inProgressTrips,
    completedTrips,
    cancelledTrips,
    averageRating: averageRating ? parseFloat(averageRating.averageRating).toFixed(2) : 0,
    completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0
  };
};

/**
 * Get user growth statistics
 * @param {Object} filter - Date range filter
 * @returns {Promise<Array>}
 */
const getUserGrowthStats = async (filter) => {
  const { startDate, endDate, interval = 'month' } = filter;
  
  let dateFormat;
  switch (interval) {
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      dateFormat = 'YYYY-WW'; // ISO week format
      break;
    case 'month':
    default:
      dateFormat = 'YYYY-MM';
      break;
  }

  const users = await User.findAll({
    attributes: [
      [sequelize.fn('date_format', sequelize.col('createdAt'), dateFormat), 'date'],
      [sequelize.fn('count', sequelize.col('id')), 'count']
    ],
    where: startDate && endDate ? {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    } : {},
    group: [sequelize.fn('date_format', sequelize.col('createdAt'), dateFormat)],
    order: [[sequelize.fn('date_format', sequelize.col('createdAt'), dateFormat), 'ASC']],
    raw: true
  });

  return users;
};

/**
 * Get revenue statistics
 * @param {Object} filter - Date range filter
 * @returns {Promise<Array>}
 */
const getRevenueStats = async (filter) => {
  const { startDate, endDate, interval = 'month' } = filter;
  
  let dateFormat;
  switch (interval) {
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      dateFormat = 'YYYY-WW'; // ISO week format
      break;
    case 'month':
    default:
      dateFormat = 'YYYY-MM';
      break;
  }

  const revenue = await Payment.findAll({
    attributes: [
      [sequelize.fn('date_format', sequelize.col('createdAt'), dateFormat), 'date'],
      [sequelize.fn('sum', sequelize.col('amount')), 'total']
    ],
    where: {
      status: 'completed',
      ...(startDate && endDate ? {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      } : {})
    },
    group: [sequelize.fn('date_format', sequelize.col('createdAt'), dateFormat)],
    order: [[sequelize.fn('date_format', sequelize.col('createdAt'), dateFormat), 'ASC']],
    raw: true
  });

  return revenue;
};

/**
 * Get top drivers by rating or earnings
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Array>}
 */
const getTopDrivers = async (filter) => {
  const { limit = 10, sortBy = 'rating' } = filter;
  
  let orderCriteria;
  if (sortBy === 'earnings') {
    orderCriteria = [['totalEarnings', 'DESC']];
  } else {
    orderCriteria = [['rating', 'DESC']];
  }

  const drivers = await User.findAll({
    where: {
      role: 'driver',
      status: 'active'
    },
    attributes: ['id', 'firstName', 'lastName', 'email', 'rating', 'totalEarnings', 'completedTrips'],
    order: orderCriteria,
    limit: parseInt(limit, 10),
  });

  return drivers;
};

/**
 * Get popular routes
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Array>}
 */
const getPopularRoutes = async (filter) => {
  const { limit = 10 } = filter;
  
  // This is a simplified example - in a real app you'd do more sophisticated 
  // aggregation of routes based on start/end locations
  const trips = await Trip.findAll({
    attributes: [
      'startLocation',
      'endLocation',
      [sequelize.fn('count', sequelize.col('id')), 'tripCount']
    ],
    group: ['startLocation', 'endLocation'],
    order: [[sequelize.literal('tripCount'), 'DESC']],
    limit: parseInt(limit, 10),
    raw: true
  });

  return trips;
};

module.exports = {
  getPlatformStats,
  getTripStats,
  getUserGrowthStats,
  getRevenueStats,
  getTopDrivers,
  getPopularRoutes
}; 