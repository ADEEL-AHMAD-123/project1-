const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

class StripeService {
  // Create Stripe Payment Intent
  async createPaymentIntent(order) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalPrice * 100), // Amount in cents
        currency: 'usd',
        metadata: { orderId: order._id.toString(), userId: order.user.toString() },
      });

      logger.info(`PaymentIntent created for order ${order._id}`, { paymentIntentId: paymentIntent.id });

      return paymentIntent;
    } catch (error) {
      logger.error(`Error creating PaymentIntent: ${error.message}`, { orderId: order._id });
      throw new Error('PaymentIntent creation failed');
    }
  }

  // Handle Stripe Webhook Events
  async handleWebhook(event) {
    const intent = event.data.object;

    // Handle specific payment statuses
    if (event.type === 'payment_intent.succeeded') {
      return { status: 'completed', intent };
    } else if (event.type === 'payment_intent.payment_failed') {
      return { status: 'failed', intent };
    } 
    // Add handling for the "payment_intent.created" event
    else if (event.type === 'payment_intent.created') {
      logger.info('PaymentIntent created', { intent });
      return { status: 'created', intent };
    }
    // Handle unhandled event types
    else {
      logger.warn(`Unhandled event type: ${event.type}`, { intent });
      return { status: 'unhandled', intent };
    }
  }
}

module.exports = new StripeService();
