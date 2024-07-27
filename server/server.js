require('dotenv').config({ path: './config/.env' });
const app = require("./app");
const connectDatabase = require("./config/db-connection");
const logger = require("./utils/logger"); 


// Connect to the database
connectDatabase()
  .then(() => {
    // Start the server
    const server = app.listen(process.env.PORT, () => {
      logger.info(`Server is running on ${process.env.HOST}:${process.env.PORT}`);

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
