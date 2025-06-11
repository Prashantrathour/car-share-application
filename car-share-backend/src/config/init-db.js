const { sequelize } = require('./database');
const { User } = require('../models');

const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');

    // Create admin user if it doesn't exist
    const adminUser = await User.findOne({
      where: { email: 'admin@carsharing.com' }
    });

    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@carsharing.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Admin user created successfully.');
    }

  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
};

module.exports = initializeDatabase; 