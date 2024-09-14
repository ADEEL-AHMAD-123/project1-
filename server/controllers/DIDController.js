const DID = require('../models/DID');
const Pricing = require('../models/DIDPricing');
const logger = require('../utils/logger'); 
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');



// @desc    Add a new DID
// @route   POST /api/v1/dids
// @access  Admin
exports.addDID = catchAsyncErrors(async (req, res, next) => {
  const { didNumber, country, state, areaCode, price } = req.body;

  // Check if DID already exists
  const existingDID = await DID.findOne({ didNumber });
  if (existingDID) {
    return next(createError(400, 'DID number already exists.'));
  }

  // Create new DID
  const did = await DID.create({
    didNumber,
    country,
    state,
    areaCode,
    price,
    status: 'available',
  });

  logger.info('New DID added', { didId: did._id });

  res.status(201).json({
    success: true,
    message: 'DID successfully added',
    did,
  });
});



// @desc    Add DIDs in bulk
// @route   POST /api/v1/dids/bulk
// @access  Admin
exports.addDIDsInBulk = catchAsyncErrors(async (req, res, next) => {
  const dids = req.body.dids;

  if (!Array.isArray(dids) || dids.length === 0) {
    return next(createError(400, 'Please provide an array of DIDs'));
  }

  // Ensure each DID has the necessary fields
  for (const did of dids) {
    if (!did.didNumber || !did.country || !did.state || !did.areaCode || !did.price) {
      return next(createError(400, 'Each DID must contain didNumber, country, state, areaCode, and price.'));
    }
  }

  try {
    // Use MongoDB's insertMany for efficient bulk insertion
    const insertedDIDs = await DID.insertMany(dids);

    logger.info('Bulk DIDs added', { count: insertedDIDs.length });

    res.status(201).json({
      success: true,
      message: `${insertedDIDs.length} DIDs successfully added.`,
      insertedDIDs,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(createError(400, 'Duplicate DID numbers detected. Ensure all DIDs are unique.'));
    }
    return next(createError(500, 'An error occurred while adding DIDs.'));
  }
});


// @desc    Get available DIDs for purchase with filtering, searching, and pagination
// @route   GET /api/v1/dids/available
// @access  Private
exports.getAvailableDIDs = catchAsyncErrors(async (req, res, next) => {
  const { country, state, areaCode, page = 1, limit = 10 } = req.query;

  const query = { status: 'available' };
  if (country) query.country = country;
  if (state) query.state = state;
  if (areaCode) query.areaCode = areaCode;

  const totalDIDs = await DID.countDocuments(query);
  const dids = await DID.find(query)
                        .skip((page - 1) * limit)
                        .limit(limit);

  logger.info('Fetched available DIDs', {
    userId: req.user.id,
    count: dids.length,
    query,
  });

  res.status(200).json({
    success: true,
    count: dids.length,
    totalPages: Math.ceil(totalDIDs / limit),
    currentPage: page,
    dids
  });
});

// @desc    Get global pricing for DIDs
// @route   GET /api/v1/dids/pricing
// @access  Public
exports.getGlobalPricing = catchAsyncErrors(async (req, res, next) => {
  const pricing = await Pricing.findOne(); // Assuming only one pricing document

  if (!pricing) {
    logger.error('No pricing data found', { ip: req.ip });
    return next(createError(404, 'No pricing data found'));
  }

  logger.info('Fetched global pricing', { ip: req.ip });

  res.status(200).json({
    success: true,
    globalPricing: {
      bulkPrice: pricing.bulkPrice,
      individualPrice: pricing.individualPrice,
    },
  });
});

// @desc    Edit technical configuration of a purchased DID
// @route   PUT /api/v1/dids/:id/config
// @access  Private
exports.editDIDConfig = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { destination } = req.body;

  const did = await DID.findById(id);
  if (!did) {
    logger.error('DID not found for editing', { userId: req.user.id, didId: id });
    return next(createError(404, 'DID not found'));
  }

  if (did.status !== 'purchased') {
    logger.error('Attempt to edit non-purchased DID', { userId: req.user.id, didId: id, status: did.status });
    return next(createError(400, 'Only purchased DIDs can be configured'));
  }

  did.destination = destination;
  await did.save();

  logger.info('DID configuration updated', { userId: req.user.id, didId: id });

  res.status(200).json({ success: true, message: 'DID configuration updated', did });
});

// @desc    Schedule DID deletion after X days
// @route   DELETE /api/v1/dids/:id
// @access  Private
exports.deleteDID = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const did = await DID.findById(id);
  if (!did) {
    logger.error('DID not found for deletion', { userId: req.user.id, didId: id });
    return next(createError(404, 'DID not found'));
  }

  if (did.status !== 'purchased') {
    logger.error('Attempt to delete non-purchased DID', { userId: req.user.id, didId: id, status: did.status });
    return next(createError(400, 'Only purchased DIDs can be deleted'));
  }

  // Schedule deletion
  did.status = 'scheduled_deletion';
  did.deleteScheduledDate = new Date(Date.now() + did.deleteAfterDays * 24 * 60 * 60 * 1000);
  await did.save();

  logger.info('DID scheduled for deletion', { userId: req.user.id, didId: id, scheduledDeletion: did.deleteScheduledDate });

  res.status(200).json({ success: true, message: 'DID scheduled for deletion', did });
});
