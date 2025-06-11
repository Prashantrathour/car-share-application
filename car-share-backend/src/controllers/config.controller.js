const httpStatus = require('http-status');
const config = require('../config/config');

/**
 * Get client-side Firebase configuration
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getFirebaseConfig = async (req, res) => {
  res.status(httpStatus.OK).json({
    firebase: config.firebase.client
  });
};

module.exports = {
  getFirebaseConfig,
}; 