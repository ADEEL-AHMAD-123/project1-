
const Order = require('../models/Order');
const DID = require('../models/DID');
const logger = require('../utils/logger');

// Background job to clean up expired orders and release DIDs
const cleanUpExpiredOrders = async () => {
  const expiredOrders = await Order.find({ expiresAt: { $lt: new Date() }, paymentStatus: 'pending' });

  if (expiredOrders.length > 0) {
    for (const order of expiredOrders) {
      // Release reserved DIDs
      await DID.updateMany({ _id: { $in: order.dids.map(d => d.did) } }, { status: 'available' });

      // Mark order as cancelled
      order.orderStatus = 'cancelled';
      await order.save();

      logger.info('Expired order cancelled and DIDs released', { orderId: order._id });
    }
  }
};

module.exports = cleanUpExpiredOrders;
