const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const config = require('../config/database');
const logger = require('../config/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
);

const umzug = new Umzug({
  migrations: {
    path: './src/database/migrations',
    params: [sequelize.getQueryInterface(), Sequelize],
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const initializeDatabase = async (force = false) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    if (force) {
      // Drop all tables if force is true
      await sequelize.drop();
      logger.info('All tables dropped.');
    }

    // Run migrations
    await umzug.up();
    logger.info('Database migrations completed successfully.');

    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initializeDatabase
}; 