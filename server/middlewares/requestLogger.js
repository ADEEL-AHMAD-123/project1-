const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Normalize IPv6 to IPv4 if necessary
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }

  // Safely handle cases where req.body might be undefined (like in GET requests)
  const safeBody = req.body ? { ...req.body } : {}; // Clone req.body or set to an empty object if undefined

  if (safeBody.password) {
    delete safeBody.password; // Exclude password if it exists
  }

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
