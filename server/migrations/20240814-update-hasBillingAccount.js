module.exports = {
    async up(db, client) {
      const billingUsers = await db.collection('billingaccounts').distinct('user_id');
  
      await db.collection('users').updateMany(
        { _id: { $in: billingUsers } },
        { $set: { hasBillingAccount: true } }
      );
  
      console.log('hasBillingAccount field updated for users with billing accounts.');
    },
  
    async down(db, client) {
      await db.collection('users').updateMany(
        { hasBillingAccount: true },
        { $set: { hasBillingAccount: false } }
      );
  
      console.log('Reverted hasBillingAccount field for all users.');
    }
  };
  