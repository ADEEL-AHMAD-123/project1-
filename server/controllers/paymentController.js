const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');

// @desc    Make payment for an order
// @route   POST /api/v1/payments/:orderId
// @access  Private
exports.payForOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { token } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    logger.error('Order not found for payment', { userId: req.user.id, orderId });
    return next(createError(404, 'Order not found'));
  }

  const charge = await stripe.charges.create({
    amount: order.totalAmount * 100, // Stripe expects amount in cents
    currency: 'usd',
    source: token,
    description: `Order ${orderId} payment`,
  });

  if (charge.status === 'succeeded') {
    order.paymentStatus = 'completed';
    await order.save();

    logger.info('Payment successful', { userId: req.user.id, orderId, chargeId: charge.id });

    res.status(200).json({ success: true, message: 'Payment successful', charge, order });
  } else {
    order.paymentStatus = 'failed';
    await order.save();

    logger.error('Payment failed', { userId: req.user.id, orderId, chargeId: charge.id });

    return next(createError(400, 'Payment failed'));
  }
});
