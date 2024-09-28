const express = require('express');
const router = express.Router();
const { createOrder, stripeWebhook } = require('../controllers/orderController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/create', isAuthenticatedUser, createOrder);

// Webhook endpoint to handle Stripe events
router.post('/payments/webhooks', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
