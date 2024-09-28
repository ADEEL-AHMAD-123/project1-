const logger = require('../utils/logger');
const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server Error";

  // Check if req.body exists before destructuring
  const safeBody = req.body ? { ...req.body } : {};
  if (safeBody.password) {
    delete safeBody.password;  // Exclude password from the request body for safe logging
  }

  // Log the error
  logger.error(err.message, {
    ip: req.ip,
    meta: {
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: safeBody,  // Use the safeBody without the password
      query: req.query
    }
  });

  // Handle common errors
  // Wrong MongoDB ID error
  if (err.name === "CastError") {
    const message = `Resource not found with this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Your URL is invalid please try again later`;
    err = new ErrorHandler(message, 400);
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    const message = `Your URL is expired please try again later!`;
    err = new ErrorHandler(message, 400);
  }

  // Send the error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
