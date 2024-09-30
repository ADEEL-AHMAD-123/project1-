const DID = require('../models/DID');
const Pricing = require('../models/DIDPricing');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');
const User=require('../models/user')

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

  // Case-insensitive search using regular expressions
  if (country) query.country = { $regex: new RegExp(country, 'i') };
  if (state) query.state = { $regex: new RegExp(state, 'i') };
  if (areaCode) query.areaCode = { $regex: new RegExp(areaCode, 'i') };

  const totalDIDs = await DID.countDocuments(query);
  const dids = await DID.find(query)
                        .skip((page - 1) * limit)
                        .limit(limit);

  // Mask last four digits of didNumber
  const maskedDIDs = dids.map(did => {
    const { didNumber, ...rest } = did.toObject(); // Convert mongoose document to plain object
    if (didNumber && didNumber.length === 10) {
      const maskedNumber = didNumber.slice(0, -4) + '****'; // Masking last four digits
      return { didNumber: maskedNumber, ...rest };
    }
    return did; // Return the original if didNumber is not valid
  });

  logger.info('Fetched available DIDs', {
    userId: req.user.id,
    count: maskedDIDs.length,
    query,
  });

  res.status(200).json({
    success: true,
    count: maskedDIDs.length,
    pagination:{
      totalPages: Math.ceil(totalDIDs / limit),
      currentPage: page
    },
    dids: maskedDIDs
  });
});


// @desc    Get all DIDs of the logged-in user
// @route   GET /api/v1/dids/myDids
// @access  Private
exports.getMyDIDs = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Fetch DIDs associated with the logged-in user
  const dids = await DID.find({ userId });

  if (!dids || dids.length === 0) {
    logger.info('No DIDs found for the user', { userId });
    return next(createError(404, 'No DIDs found for the user'));
  }

  logger.info('Fetched user\'s DIDs', { userId, count: dids.length });

  res.status(200).json({
    success: true,
    count: dids.length,
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


// @desc    Get global DID pricing
// @route   GET /api/v1/dids/pricing/global
// @access  Public
exports.getGlobalPricing = catchAsyncErrors(async (req, res, next) => {
  const pricing = await Pricing.findOne();

  if (!pricing) {
    return next(createError(404, 'No global pricing data found'));
  }

  res.status(200).json({
    success: true,
    pricing: {
      nonBulkPrice: pricing.nonBulkPrice,
      bulkPrice: pricing.bulkPrice,
      bulkThreshold: pricing.bulkThreshold,
      lastModified: pricing.lastModified,
    },
  });
});

 
// @desc    Set or update global DID pricing
// @route   POST /api/v1/dids/pricing/global
// @access  Private (Admin)
exports.setGlobalPricing = catchAsyncErrors(async (req, res, next) => {
  const { nonBulkPrice, bulkPrice, bulkThreshold } = req.body;

  let pricing = await Pricing.findOne();

  if (pricing) {
    // Update existing pricing
    pricing.nonBulkPrice = nonBulkPrice;
    pricing.bulkPrice = bulkPrice;
    pricing.bulkThreshold = bulkThreshold;
    pricing.lastModified = Date.now();
  } else {
    // Create new pricing if none exists
    pricing = new Pricing({
      nonBulkPrice,
      bulkPrice,
      bulkThreshold,
    });
  }

  await pricing.save();

  res.status(200).json({
    success: true,
    message: 'Global pricing updated successfully',
    pricing,
  });
});


// @desc    Get DID pricing for a specific user
// @route   GET /api/v1/dids/pricing/user/:userId
// @access  Private (Admin)
exports.getUserPricing = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.userId);


  if (!user) {
    return next(createError(404, 'User not found'));
  }

  const globalPricing = await Pricing.findOne();

  if (!globalPricing) {
    return next(createError(404, 'No global pricing data found'));
  }

  // Use user-specific pricing if available, otherwise fallback to global
  const pricing = {
    nonBulkPrice: user.pricing?.nonBulkPrice || globalPricing.nonBulkPrice,
    bulkPrice: user.pricing?.bulkPrice || globalPricing.bulkPrice,
    bulkThreshold: user.pricing?.bulkThreshold || globalPricing.bulkThreshold,
  };

  res.status(200).json({
    success: true,
    user: user._id,
    pricing,
  });
});


// @desc    Set or update DID pricing for a specific user
// @route   POST /api/v1/dids/pricing/user/:userId
// @access  Private (Admin)
exports.setUserPricing = catchAsyncErrors(async (req, res, next) => {
  const { nonBulkPrice, bulkPrice, bulkThreshold } = req.body;

  let user = await User.findById(req.params.userId);

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Update user-specific pricing
  user.pricing = {
    nonBulkPrice: nonBulkPrice || user.pricing?.nonBulkPrice,
    bulkPrice: bulkPrice || user.pricing?.bulkPrice,
    bulkThreshold: bulkThreshold || user.pricing?.bulkThreshold,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User-specific pricing updated successfully',
    userPricing: user.pricing,
  });
});


