const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const analyticsService = require('../services/analytics.service');

const getPlatformStats = catchAsync(async (req, res) => {
  const stats = await analyticsService.getPlatformStats();
  res.status(httpStatus.OK).send(stats);
});

const getTripStats = catchAsync(async (req, res) => {
  const stats = await analyticsService.getTripStats(req.query);
  res.status(httpStatus.OK).send(stats);
});

const getUserGrowthStats = catchAsync(async (req, res) => {
  const stats = await analyticsService.getUserGrowthStats(req.query);
  res.status(httpStatus.OK).send(stats);
});

const getRevenueStats = catchAsync(async (req, res) => {
  const stats = await analyticsService.getRevenueStats(req.query);
  res.status(httpStatus.OK).send(stats);
});

const getTopDrivers = catchAsync(async (req, res) => {
  const drivers = await analyticsService.getTopDrivers(req.query);
  res.status(httpStatus.OK).send(drivers);
});

const getPopularRoutes = catchAsync(async (req, res) => {
  const routes = await analyticsService.getPopularRoutes(req.query);
  res.status(httpStatus.OK).send(routes);
});

module.exports = {
  getPlatformStats,
  getTripStats,
  getUserGrowthStats,
  getRevenueStats,
  getTopDrivers,
  getPopularRoutes
}; 