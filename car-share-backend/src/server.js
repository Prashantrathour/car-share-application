const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize, initializeDatabase } = require('./models');
const path = require('path');
const fs = require('fs');

let server;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err.message,
    stack: err.stack,
    code: err.code
  });
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Initialize database and start server
async function startServer() {
  try {
    logger.info('Starting server initialization...');
    
    // Initialize database without forcing recreation
    logger.info('Initializing database...');
    await initializeDatabase(false);
    logger.info('Database initialization complete.');
    
    // Start the server
    logger.info('Starting HTTP server...');
    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });

    // Initialize socket.io
    logger.info('Initializing Socket.IO...');
    const io = require('socket.io')(server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
      }
    });
    
    require('./socket')(io);
    
    // Store io instance in app for use in controllers
    app.set('io', io);
    logger.info('Socket.IO initialization complete.');
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', {
        error: err.message,
        stack: err.stack,
        code: err.code
      });
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
    
    // Handle SIGTERM signal
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      try {
        await sequelize.close();
        if (server) {
          server.close(() => {
            logger.info('Process terminated!');
            process.exit(0);
          });
        }
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Server startup failed:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      details: error
    });
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
}

startServer();