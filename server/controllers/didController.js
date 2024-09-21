const DID = require('../models/DID');
const Pricing = require('../models/DIDPricing');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');


// @desc    Add a new DID
// @route   POST /api/v1/dids
// @access  Private
exports.addDID = catchAsyncErrors(async (req, res, next) => {
  const { didNumber, country, state, areaCode, destination } = req.body;

  // Validate required fields
  if (!didNumber || !country || !state || !areaCode) {
    logger.error('Failed to add DID: Missing required fields', { userId: req.user.id });
    return next(createError(400, 'Missing required fields'));
  }

  // Check if the DID number already exists
  const existingDID = await DID.findOne({ didNumber });
  if (existingDID) {
    logger.error('DID already exists', { userId: req.user.id, didNumber });
    return next(createError(400, 'DID number already exists'));
  }

  // Create new DID
  const newDID = new DID({
    didNumber,
    country,
    state,
    areaCode,
    destination
  });

  await newDID.save();

  logger.info('DID added successfully', { userId: req.user.id, didNumber });

  res.status(201).json({
    success: true,
    message: 'DID added successfully',
    did: newDID
  });
});


// @desc    Add multiple DIDs in bulk
// @route   POST /api/v1/dids/bulk
// @access  Private
exports.addDIDsInBulk = catchAsyncErrors(async (req, res, next) => {
  const dids = req.body;

  // Validate input
  if (!Array.isArray(dids) || dids.length === 0) {
    logger.error('Failed to add DIDs in bulk: Invalid input', { userId: req.user.id });
    return next(createError(400, 'Invalid input'));
  }

  // Collect existing DID numbers
  const didNumbers = dids.map(did => did.didNumber);
  const existingDIDs = await DID.find({ didNumber: { $in: didNumbers } }).select('didNumber');
  const existingNumbers = existingDIDs.map(did => did.didNumber);

  // If any DID numbers already exist
  if (existingNumbers.length > 0) {
    logger.error('DID numbers already exist', { userId: req.user.id, existingNumbers });
    return next(createError(400, `DID numbers already exist: ${existingNumbers.join(', ')}`));
  }

  // Insert new DIDs
  await DID.insertMany(dids);

  logger.info('DIDs added in bulk successfully', { userId: req.user.id, count: dids.length });

  res.status(201).json({
    success: true,
    message: 'DIDs added in bulk successfully',
    count: dids.length
  });
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


// @desc    Get global pricing for DIDs
// @route   GET /api/v1/dids/pricing
// @access  Public
exports.getGlobalPricing = catchAsyncErrors(async (req, res, next) => {
  const pricing = await Pricing.findOne();

  if (!pricing) {
    logger.error('Global pricing fetch failed: No pricing data found', { ip: req.ip });
    return next(createError(404, 'No pricing data found'));
  }

  logger.info('Fetched global pricing', { ip: req.ip });

  res.status(200).json({
    success: true,
    pricing: {
      individualPrice: pricing.individualPrice,
      bulkPrice: pricing.bulkPrice,
      lastModified: pricing.lastModified,
    },
  });
});
 



// @desc    Add or update global pricing for DIDs
// @route   POST /api/v1/dids/pricing
// @access  Private
exports.addOrUpdateGlobalPricing = catchAsyncErrors(async (req, res, next) => {
  const { individualPrice, bulkPrice } = req.body;

  if (!individualPrice || !bulkPrice) {
    logger.error('Failed pricing update: Missing individual or bulk price', { userId: req.user.id });
    return next(createError(400, 'Both individual and bulk prices are required'));
  }

  let pricing = await Pricing.findOne();

  if (pricing) {
    // Update the existing global pricing
    pricing.individualPrice = individualPrice;
    pricing.bulkPrice = bulkPrice;
    pricing.lastModified = Date.now();
    logger.info('Global pricing updated', { userId: req.user.id, individualPrice, bulkPrice });
  } else {
    // Create new global pricing if none exists
    pricing = new Pricing({
      individualPrice,
      bulkPrice
    });
    logger.info('Global pricing created', { userId: req.user.id, individualPrice, bulkPrice });
  }

  await pricing.save();

  res.status(200).json({
    success: true,
    message: 'Global pricing updated successfully',
    pricing,
  });
});

