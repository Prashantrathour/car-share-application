/**
 * Create a pagination object
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 * @returns {Object}
 */
const createPagination = (page, limit, total) => {
  const pages = Math.ceil(total / limit);
  const pagination = {
    total,
    page,
    limit,
    pages,
  };

  return pagination;
};

/**
 * Create pagination options for Sequelize
 * @param {number} page
 * @param {number} limit
 * @returns {Object}
 */
const getPaginationOptions = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

module.exports = {
  createPagination,
  getPaginationOptions,
};