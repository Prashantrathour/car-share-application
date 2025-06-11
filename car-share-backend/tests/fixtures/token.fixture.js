const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../../src/config/config');
const { Token } = require('../../src/models');
const tokenTypes = require('../../src/utils/tokenTypes');

const getAccessToken = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = jwt.sign(
    {
      sub: user.id,
      iat: moment().unix(),
      exp: accessTokenExpires.unix(),
      type: tokenTypes.ACCESS,
    },
    config.jwt.secret
  );

  await Token.create({
    token: accessToken,
    user_id: user.id,
    type: tokenTypes.ACCESS,
    expires: accessTokenExpires.toDate(),
  });

  return accessToken;
};

const getRefreshToken = async (user) => {
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = jwt.sign(
    {
      sub: user.id,
      iat: moment().unix(),
      exp: refreshTokenExpires.unix(),
      type: tokenTypes.REFRESH,
    },
    config.jwt.secret
  );

  await Token.create({
    token: refreshToken,
    user_id: user.id,
    type: tokenTypes.REFRESH,
    expires: refreshTokenExpires.toDate(),
  });

  return refreshToken;
};

module.exports = {
  getAccessToken,
  getRefreshToken,
}; 