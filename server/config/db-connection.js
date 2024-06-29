const mongoose = require('mongoose');
const logger = require('../utils/logger'); 


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
};

module.exports = connectDB;
