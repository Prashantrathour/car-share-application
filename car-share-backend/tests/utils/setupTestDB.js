const { sequelize } = require('../../src/models');
const config = require('../../src/config/config');
const path = require('path');
const fs = require('fs');

const waitForFileUnlock = async (filePath, maxAttempts = 5) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Try to open the file for writing to check if it's locked
      const fd = fs.openSync(filePath, 'r+');
      fs.closeSync(fd);
      return true;
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

const removeFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await waitForFileUnlock(filePath);
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Warning: Could not remove file ${filePath}:`, err.message);
  }
};

const clearDatabase = async () => {
  try {
    // Use transaction to ensure atomicity
    await sequelize.transaction(async (t) => {
      const models = Object.values(sequelize.models);
      for (const model of models) {
        await model.destroy({ 
          where: {},
          force: true,
          transaction: t,
          cascade: true
        });
      }
    });
  } catch (error) {
    console.warn('Warning: Error clearing database:', error.message);
  }
};

const initializeTestDatabase = async () => {
  // Create test database directory if it doesn't exist
  const dbDir = path.dirname(path.resolve(process.cwd(), config.db.storage));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Remove any existing test database files
  const dbFiles = [
    config.db.storage,
    `${config.db.storage}-journal`,
    `${config.db.storage}-wal`,
    `${config.db.storage}-shm`,
    `${config.db.storage}.lock`
  ];
  
  await Promise.all(dbFiles.map(file => 
    removeFile(path.resolve(process.cwd(), file))
  ));
  
  // Test database connection and sync
  try {
    await sequelize.authenticate();
    console.log('Test database connection established successfully.');
    
    // Sync database with force option to recreate tables
    await sequelize.sync({ force: true });
    console.log('Test database tables have been created successfully.');
  } catch (error) {
    console.error('Unable to initialize test database:', error);
    throw error;
  }
};

const setupTestDB = () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    try {
      await clearDatabase();
      
      // Close database connection
      await sequelize.close();
      
      // Clean up test database files
      const dbFiles = [
        config.db.storage,
        `${config.db.storage}-journal`,
        `${config.db.storage}-wal`,
        `${config.db.storage}-shm`,
        `${config.db.storage}.lock`
      ];
      
      await Promise.all(dbFiles.map(file => 
        removeFile(path.resolve(process.cwd(), file))
      ));
    } catch (error) {
      console.warn('Warning: Error during test cleanup:', error.message);
    }
  });
};

module.exports = setupTestDB; 