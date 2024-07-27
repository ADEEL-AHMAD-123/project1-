const cron = require('node-cron');
const Log = require('../models/log');

// Archive logs older than a week
cron.schedule('0 0 * * *', async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    await Log.updateMany(
      { timestamp: { $lt: oneWeekAgo }, archived: { $ne: true } }, 
      { $set: { archived: true } }
    );
    console.log('Logs older than a week have been archived');
  } catch (err) {
    console.error('Error archiving logs:', err);
  }
});

// Delete logs older than two weeks
cron.schedule('0 0 * * *', async () => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  try {
    await Log.deleteMany({ timestamp: { $lt: twoWeeksAgo }, archived: true });
    console.log('Archived logs older than two weeks have been deleted');
  } catch (err) {
    console.error('Error deleting logs:', err);
  }
});
