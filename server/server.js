require('dotenv').config({ path: './config/.env' });
const server = require("./app"); // Import the server instance
const connectDatabase = require("./config/db-connection");
const logger = require("./utils/logger"); 

// Connect to the database
connectDatabase()
  .then(() => {
    // Start the server
    server.listen(process.env.PORT || 8000, () => {
      logger.info(`Server is running on ${process.env.HOST}:${process.env.PORT || 8000}`);
    });

    // Handling unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
      logger.info("Shutting down the server due to unhandled promise rejection.");

      server.close(() => {
        process.exit(1);
      });
    });

    // Handling uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
      logger.info("Shutting down the server due to uncaught exception.");

      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    logger.error("Database connection error:", { error: err.message });
    process.exit(1); // Exit process on database connection error
  });
 