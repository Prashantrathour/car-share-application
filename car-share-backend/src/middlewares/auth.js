const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { User, Token } = require('../models');
const { Op } = require('sequelize');

const auth = () => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    if (decoded.type !== 'access') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }

    const user = await User.findByPk(decoded.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    if (user.status !== 'active') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
    } else {
      next(error);
    }
  }
};
const verifyAuth = () => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    if (decoded.type !== 'access') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }

    const user = await User.findByPk(decoded.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    // if (user.status !== 'active') {
    //   throw new ApiError(httpStatus.UNAUTHORIZED, 'User account is not active');
    // }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
    } else {
      next(error);
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      if (roles.includes('user')) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Access denied. Only users and admins can create bookings.'));
      }
      return next(new ApiError(httpStatus.FORBIDDEN, 'Access denied. You do not have permission to perform this action.'));
    }
    return next();
  };
};

module.exports = {
  auth,
  authorize,
  verifyAuth
};