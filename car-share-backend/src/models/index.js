const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../config/logger');

// Log the database configuration
logger.info('Database configuration:', {
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  username: config.db.username,
  ssl: config.db.dialectOptions.ssl
});

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    dialectOptions: {
      ...config.db.dialectOptions,
      connectTimeout: 10000 // Reduce timeout to 10 seconds
    },
    logging: (msg) => logger.debug('Sequelize:', msg),
    pool: {
      max: 1,
      min: 0,
      acquire: 10000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./User');
const Vehicle = require('./Vehicle');
const Trip = require('./Trip');
const Booking = require('./Booking');
const Message = require('./Message');
const Review = require('./Review');
const Payment = require('./Payment');
const Token = require('./Token');

// Initialize models
const models = {
  User: User(sequelize),
  Vehicle: Vehicle(sequelize),
  Trip: Trip(sequelize),
  Booking: Booking(sequelize),
  Message: Message(sequelize),
  Review: Review(sequelize),
  Payment: Payment(sequelize),
  Token: Token(sequelize)
};

// Set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const initializeDatabase = async (force = false) => {
  let retries = 3;
  while (retries > 0) {
    try {
      logger.info('Attempting database connection...');
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');
      logger.info('Connection details:', {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        username: config.db.username,
        ssl: config.db.dialectOptions.ssl
      });

      // Sync all models
      logger.info('Syncing database models...');
      await sequelize.sync({ force });
      logger.info('Database models synchronized successfully.');
      
      return true;
    } catch (error) {
      retries--;
      logger.error('Connection Error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        errno: error.errno,
        stack: error.stack
      });
      
      // Additional error information
      if (error.parent) {
        logger.error('Parent Error:', {
          code: error.parent.code,
          message: error.parent.message,
          hint: error.parent.hint
        });
      }

      if (retries === 0) {
        throw error;
      }
      
      logger.warn(`Database connection attempt failed. ${retries} retries remaining...`);
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing database connection:', error);
    process.exit(1);
  }
});

module.exports = {
  sequelize,
  initializeDatabase,
  ...models
};