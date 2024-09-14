// server/jobs/jobScheduler.js
const cron = require('node-cron');
const cleanUpExpiredOrders = require('./orderCleanupJob');
const logger = require('../utils/logger');

// Schedule the cleanup job to run every 15 minutes
const scheduleJobs = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      await cleanUpExpiredOrders();
      logger.info('Order cleanup job completed successfully');
    } catch (error) {
      logger.error('Error running order cleanup job', { error });
    }
  });

  // Schedule other jobs as needed
  cron.schedule('0 0 * * *', async () => {
    try {
      await otherJob1();
      logger.info('Other job 1 completed successfully');
    } catch (error) {
      logger.error('Error running other job 1', { error });
    }
  });


};

module.exports = { scheduleJobs };
