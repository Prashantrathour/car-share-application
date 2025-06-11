/**
 * Wrapper to catch async errors
 * @param {Function} fn - Async function to execute
 * @returns {Function} - Express middleware function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;