const logger = require('../utils/logger');
const createError = require('http-errors');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const Order = require('../models/Order');
const DID = require('../models/DID');
const BillingAccount = require('../models/BillingAccount');
const { getBillingServer } = require('../utils/switchBillingHelpers');
const { assignDIDToUser, assignServerToUser } = require('../services/AssignItems');

// @desc    Create a new order and deduct credit from billing account
// @route   POST /api/v1/orders/create
// @access  Private
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        logger.error('Failed to create order: No order items provided', { userId: req.user._id });
        return next(createError(400, 'Order items are required'));
    }
    // Check availability of all DIDs before proceeding
    for (const item of orderItems) {
      if (item.referenceType === 'DID') {
          const did = await DID.findById(item.referenceId);
          if (!did || did.status !== 'available') {
              logger.error(`DID ${item.referenceId} is not available for assignment`, { userId: req.user._id });
              return next(createError(400, `DID ${item.referenceId} is not available for assignment`));
          }
      }
  }

  

    // Find the user's BillingAccount
    const billingAccount = await BillingAccount.findOne({ user_id: req.user._id });
    if (!billingAccount) {
        logger.error('Billing account not found', { userId: req.user._id });
        return next(createError(404, 'Billing account not found.'));
    }

    console.log('debugging: ',billingAccount.credit,totalPrice)

    // Check if the user has enough credit
    if (billingAccount.credit < totalPrice) {
        logger.error('Insufficient credit for order', { userId: req.user._id },billingAccount.credit,totalPrice);
        return next(createError(400, 'Insufficient credit to complete this order.'));
    }

    // Deduct the order amount from the user's billing credit
    const creditDeduction = -totalPrice;
    const billingServer = getBillingServer();

    try {
        const result = await billingServer.create('refill', {
            id_user: billingAccount.id,
            credit: creditDeduction,
            payment: 1,
            description: 'Order payment deduction',
        });

        if (!result || result.success !== true) {
            logger.error('Invalid response from billing server during credit deduction', { userId: req.user._id });
            return next(createError(400, 'Failed to deduct credit from billing account.'));
        }

        // Extract the new credit from the result's rows
        const newCredit = parseFloat(result.rows[0].credit);

        // Update the BillingAccount with the new credit from the result
        billingAccount.credit = newCredit;
        await billingAccount.save();

        // Create and save the order
        const order = new Order({
            user: req.user._id,
            orderItems,
            totalPrice,
            paymentStatus: 'completed',
            billingAccount: billingAccount._id,
        });

        await order.save();

        logger.info('Order created successfully and credit deducted', { userId: req.user._id, orderId: order._id });

        // Check orderItems and assign resources based on referenceType
        for (const item of orderItems) {
            const { referenceType, referenceId } = item;

            try {
                if (referenceType === 'DID') {
                    await assignDIDToUser(req.user._id, referenceId);
                } else if (referenceType === 'Server') {
                    await assignServerToUser(req.user._id, referenceId);
                }
            } catch (error) {
                logger.error(`Failed to assign ${referenceType} ${referenceId} to user ${req.user._id}: ${error.message}`);
                return next(createError(500, `Failed to assign ${referenceType}.`));
            }
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully, credit deducted, and resources assigned.',
            order,
            billingAccount,
        });
    } catch (err) {
        logger.error('Error processing order or updating billing credit', { userId: req.user._id, error: err.message });
        return next(createError(500, 'Internal Server Error while processing the order.'));
    }
});
