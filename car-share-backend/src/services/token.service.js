const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { User, Token } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const tokenTypes = require('../utils/tokenTypes');
const { Op } = require('sequelize');

/**
 * Generate token
 * @param {Object} user
 * @param {string} [expires]
 * @param {string} type
 * @returns {string}
 */
const generateToken = (user, expires, type) => {
  const payload = {
    sub: user.id,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,

    type,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, config.jwt.secret);
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Object}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(15, 'minutes');
  const accessToken = generateToken(
    user,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(7, 'days');
  const refreshToken = generateToken(
    user,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  // Save tokens
  await Token.create({
    token: accessToken,
    userId: user.id,
    type: tokenTypes.ACCESS,
    expires: accessTokenExpires.toDate(),
  });

  await Token.create({
    token: refreshToken,
    userId: user.id,
    type: tokenTypes.REFRESH,
    expires: refreshTokenExpires.toDate(),
  });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Object>}
 */
const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    if (payload.type !== type) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token type');
    }

    const tokenDoc = await Token.findOne({
      where: {
        token,
        expires: { [Op.gt]: new Date() },
      },
    });

    if (!tokenDoc) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    return user;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
};

module.exports = {
  generateToken,
  generateAuthTokens,
  verifyToken,
};