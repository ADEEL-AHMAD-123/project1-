const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Normalize IPv6 to IPv4 if necessary
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }

  // Exclude password from the request body for safe logging
  const { password, ...safeBody } = req.body; 
  
  logger.info('Incoming request', {
    meta: {
      ip,
      method: req.method,
      path: req.path,
      body: safeBody,
      query: req.query,
    }
  });

  next();
};
 
module.exports = requestLogger;
