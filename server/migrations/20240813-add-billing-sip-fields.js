const User = require('../models/user'); // Adjust the path as needed

module.exports = {
  async up(db, client) {
    // Use the provided db instance to perform operations
    await db.collection('users').updateMany(
      { hasBillingAccount: { $exists: false }, hasSipAccount: { $exists: false } },
      { $set: { hasBillingAccount: false, hasSipAccount: false } }
    );

    console.log('Fields added to existing users successfully.');
  },

  async down(db, client) {
    // Use the provided db instance to perform operations
    await db.collection('users').updateMany(
      {},
      { $unset: { hasBillingAccount: "", hasSipAccount: "" } }
    );

    console.log('Fields removed from existing users successfully.');
  }
};
