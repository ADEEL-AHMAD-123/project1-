const Order = require('../models/Order');
const DID = require('../models/DID');
const Pricing = require('../models/DIDPricing');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');

// @desc    Create an order for DIDs
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { didIds, isBulk } = req.body;

  const dids = await DID.find({ _id: { $in: didIds }, status: 'available' });
  if (dids.length !== didIds.length) {
    logger.error('Order creation failed due to unavailable DIDs', { userId: req.user.id, requestedDids: didIds });
    return next(createError(400, 'Some DIDs are not available for purchase'));
  }

  const pricing = await Pricing.findOne();
  if (!pricing) {
    logger.error('No pricing data found during order creation', { userId: req.user.id });
    return next(createError(500, 'Pricing configuration not found'));
  }

  // Calculate total amount
  const pricePerDID = isBulk ? pricing.bulkPrice : pricing.individualPrice;
  const totalAmount = dids.length * pricePerDID;

  // Mark DIDs as reserved
  await DID.updateMany({ _id: { $in: didIds } }, { status: 'reserved' });

  // Set order expiration (e.g., 15 minutes)
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000);

  const order = await Order.create({
    user: req.user._id,
    dids: dids.map(did => ({ did: did._id, price: pricePerDID })),
    totalAmount,
    expiresAt: expirationTime,
  });

  logger.info('Order created and DIDs reserved', { userId: req.user.id, orderId: order._id, totalAmount: order.totalAmount });

  res.status(201).json({ success: true, message: 'Order created successfully', order });
});

// @desc    Confirm an order after payment
// @route   PUT /api/v1/orders/:orderId/confirm
// @access  Private
exports.confirmOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('dids.did');
  if (!order) {
    logger.error('Order not found for confirmation', { userId: req.user.id, orderId });
    return next(createError(404, 'Order not found'));
  }

  if (order.paymentStatus !== 'completed') {
    logger.error('Attempt to confirm unpaid order', { userId: req.user.id, orderId });
    return next(createError(400, 'Payment is not completed'));
  }

  // Mark DIDs as purchased
  const didUpdates = order.dids.map(({ did }) => {
    did.status = 'purchased';
    return did.save();
  });

  await Promise.all(didUpdates);

  order.orderStatus = 'confirmed';
  await order.save();

  logger.info('Order confirmed and DIDs purchased', { userId: req.user.id, orderId });

  res.status(200).json({ success: true, message: 'Order confirmed and DIDs purchased', order });
});
