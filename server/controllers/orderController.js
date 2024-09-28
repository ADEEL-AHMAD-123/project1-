const logger = require('../utils/logger');
const createError = require('http-errors');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const Order = require('../models/Order');
const StripeService = require('../services/StripeService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create a new order
// @route   POST /api/v1/orders/create
// @access  Private
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    logger.error('Failed to create order: No order items provided', { userId: req.user._id });
    return next(createError(400, 'Order items are required'));
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    totalPrice,
  });

  await order.save();

  logger.info('Order created successfully', { userId: req.user._id, orderId: order._id });

  // Create Stripe payment intent
  const paymentIntent = await StripeService.createPaymentIntent(order);
  logger.info('Stripe payment intent created', { orderId: order._id, paymentIntentId: paymentIntent.id });

  res.status(201).json({
    success: true,
    order,
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Handle Stripe Webhook
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    const result = await StripeService.handleWebhook(event);

    if (result.status === 'completed') {
      await Order.findByIdAndUpdate(result.intent.metadata.orderId, { paymentStatus: 'completed' });
      logger.info('Payment completed', { orderId: result.intent.metadata.orderId });
    } else if (result.status === 'failed') {
      await Order.findByIdAndUpdate(result.intent.metadata.orderId, { paymentStatus: 'failed' });
      logger.error('Payment failed', { orderId: result.intent.metadata.orderId });
    } else if (result.status === 'unhandled') {
      logger.warn(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Webhook received successfully');
  } catch (err) {
    logger.error('Stripe webhook error', { error: err.message });
    return next(createError(400, 'Webhook Error'));
  }
});
