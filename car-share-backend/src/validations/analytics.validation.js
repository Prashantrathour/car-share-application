const Joi = require('joi');

const getTripStats = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  })
};

const getUserGrowthStats = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    interval: Joi.string().valid('day', 'week', 'month').default('month')
  })
};

const getRevenueStats = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    interval: Joi.string().valid('day', 'week', 'month').default('month')
  })
};

const getTopDrivers = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('rating', 'earnings').default('rating')
  })
};

const getPopularRoutes = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

module.exports = {
  getTripStats,
  getUserGrowthStats,
  getRevenueStats,
  getTopDrivers,
  getPopularRoutes
}; 