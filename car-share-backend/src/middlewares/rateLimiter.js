const rateLimit = require('express-rate-limit');
const httpStatus = require('http-status');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  skipSuccessfulRequests: false,
  message: {
    code: httpStatus.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later.',
  },
});

module.exports = {
  authLimiter,
};