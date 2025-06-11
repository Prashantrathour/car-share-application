const { Sequelize } = require('sequelize');
const config = require('./config/config');

const testConnection = async () => {
  console.log('Attempting to connect with configuration:', {
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
      logging: (msg) => console.log('Sequelize:', msg),
      pool: {
        max: 1,
        min: 0,
        acquire: 10000,
        idle: 10000
      }
    }
  );

  try {
    console.log('Attempting to authenticate...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    console.log('Connection details:', {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      username: config.db.username,
      ssl: config.db.dialectOptions.ssl
    });
  } catch (error) {
    console.error('Connection Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errno: error.errno,
      stack: error.stack
    });
    
    // Additional error information
    if (error.parent) {
      console.error('Parent Error:', {
        code: error.parent.code,
        message: error.parent.message,
        hint: error.parent.hint
      });
    }
  } finally {
    try {
      await sequelize.close();
      console.log('Connection closed.');
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
};

testConnection(); 