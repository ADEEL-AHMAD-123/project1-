
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

 // Exclude password from the request body for safe logging
  const { password, ...safeBody } = req.body; 
  
  logger.info('Incoming request', {
    ip: req.ip,
    meta: {
      method: req.method,
      path: req.path,
      body: safeBody,
      query: req.query,
    }
  });

  next();
};
 
module.exports = requestLogger;
