const logger = require('../utils/logger');
const createError = require('http-errors');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const Order = require('../models/Order');
const StripeService = require('../services/StripeService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { assignDIDToUser, assignServerToUser } = require('../services/AssignItems');

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

// Stripe webhook handler for various events
exports.stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Handle different event types from Stripe
    switch (event.type) {
      case 'payment_intent.succeeded':
        logger.info(`PaymentIntent succeeded for event: ${event.id}`);

        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        const order = await Order.findById(orderId);
        if (!order) {
          logger.error(`Order not found for orderId: ${orderId}`);
          return res.status(404).send('Order not found');
        }

        // Update payment status
        order.paymentStatus = 'completed';
        await order.save();

        // Assign items after successful payment
        for (const item of order.orderItems) {
          if (item.referenceType === 'DID') {
            await assignDIDToUser(order.user, item.referenceId);
          } else if (item.referenceType === 'Server') {
            await assignServerToUser(order.user, item.referenceId);
          }
        }

        logger.info(`Payment and assignment completed for order ${orderId}`, { orderId });
        break;

      case 'payment_intent.payment_failed':
        logger.error(`PaymentIntent failed for event: ${event.id}`);

        const failedPaymentIntent = event.data.object;
        const failedOrderId = failedPaymentIntent.metadata.orderId;

        // Update payment status to failed
        await Order.findByIdAndUpdate(failedOrderId, { paymentStatus: 'failed' });
        logger.error(`Payment failed for order ${failedOrderId}`, { failedOrderId });
        break;

      case 'charge.refunded':
        logger.info(`Charge refunded for event: ${event.id}`);
        // Handle refund logic here, such as updating order status, notifying the user, etc.
        break;

      default:
        logger.warn(`Unhandled event type: ${event.type}`, { eventId: event.id });
        break;
    }

    res.status(200).send('Webhook processed successfully');
  } catch (err) {
    logger.error('Stripe webhook error', { error: err.message });
    return next(createError(400, 'Webhook Error'));
  }
});
