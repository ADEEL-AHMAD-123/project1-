const express = require('express');
const router = express.Router();
const { payForOrder } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/:orderId', isAuthenticatedUser, payForOrder);

module.exports = router;
