const express = require('express');
const router = express.Router();
const { createOrder, confirmOrder } = require('../controllers/orderController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/', isAuthenticatedUser, createOrder);
router.put('/:orderId/confirm', isAuthenticatedUser, confirmOrder);

module.exports = router;
