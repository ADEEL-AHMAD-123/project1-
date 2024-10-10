const express = require('express');
const router = express.Router();
const { createOrder, stripeWebhook } = require('../controllers/orderController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/create', isAuthenticatedUser, createOrder);


module.exports = router;
