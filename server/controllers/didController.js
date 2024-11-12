const DID = require('../models/DID');
const Pricing = require('../models/DIDPricing');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');
const User = require('../models/user');
const csv = require('csv-parser');
const fs = require('fs');

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
    destination,
  });

  await newDID.save();

  logger.info('DID added successfully', { userId: req.user.id, didNumber });

  res.status(201).json({
    success: true,
    message: 'DID added successfully',
    did: newDID,
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

  const validDIDs = [];
  const invalidDIDs = [];

  // Validate each DID entry
  for (const did of dids) {
    const { didNumber, country, state, areaCode } = did;
    const errors = [];

    // Check for required fields
    if (!didNumber) errors.push('Missing required field: didNumber');
    if (!country) errors.push('Missing required field: country');
    if (!state) errors.push('Missing required field: state');
    if (!areaCode) errors.push('Missing required field: areaCode');

    // Validate didNumber format
    if (didNumber && !/^\d{10}$/.test(didNumber)) {
      errors.push(`${didNumber} is not a valid 10-digit DID number`);
    }

    if (errors.length > 0) {
      invalidDIDs.push({ didNumber, errors });
      continue;
    }

    // If valid, add to validDIDs array
    validDIDs.push(did);
  }

  // Check if validDIDs already exist
  const existingDIDs = await DID.find({ didNumber: { $in: validDIDs.map((d) => d.didNumber) } }).select('didNumber');
  const existingNumbers = existingDIDs.map((d) => d.didNumber);

  // If any valid DID numbers already exist, push them to invalidDIDs with a specific message
  for (const did of validDIDs) {
    if (existingNumbers.includes(did.didNumber)) {
      invalidDIDs.push({ didNumber: did.didNumber, errors: ['DID number already exists'] });
    }
  }

  // Remove already existing DIDs from validDIDs
  const newDIDs = validDIDs.filter((did) => !existingNumbers.includes(did.didNumber));

  // Insert new DIDs if there are any
  if (newDIDs.length > 0) {
    await DID.insertMany(newDIDs);
    logger.info('DIDs added in bulk successfully', { count: newDIDs.length, userId: req.user.id });
  }

  // Response construction
  res.status(201).json({
    success: true,
    message: 'DIDs processed.',
    added: newDIDs.length,
    errors: invalidDIDs.length > 0 ? invalidDIDs : undefined, // Include detailed errors if any
  });
});

// @desc    Upload bulk DIDs from a CSV file
// @route   POST /api/v1/dids/bulk/upload
// @access  Private
exports.uploadDIDsFromCSV = catchAsyncErrors(async (req, res, next) => {
  const results = [];

  // Read the CSV file 
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      console.log('Parsed data:', data); // Log parsed data
      results.push({
        didNumber: data.didNumber,
        country: data.country,
        state: data.state,
        areaCode: data.areaCode,
        destination: data.destination, // Optional
      });
    })
    .on('end', async () => {
      const mockReq = {
        user: req.user, // Ensure user info is passed for logging
        body: results,  // Provide the parsed CSV data
      };

      // Call the addDIDsInBulk function with the mock request
      await exports.addDIDsInBulk(mockReq, res, next);
      
      fs.unlinkSync(req.file.path); // Clean up file after processing
    })
    .on('error', (error) => {
      logger.error('Error reading CSV file', { error });
      fs.unlinkSync(req.file.path); // Clean up the file on error as well
      return next(createError(500, 'Error reading CSV file: ' + error.message));
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
                        .limit(Number(limit));

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
    pagination: {
      totalItems: totalDIDs,
      limit: Number(limit),
      currentPage: Number(page),
      totalPages: Math.ceil(totalDIDs / limit),
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
  const dids = await DID.find({ assignedTo:userId });

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
  try {
    const pricing = await Pricing.findOne({ userId: null });

    if (!pricing) {
      logger.warn('Attempt to access global pricing failed: No global pricing data found');
      return next(createError(404, 'No global pricing data found'));
    }

    logger.info('Fetched global pricing successfully:', {
      nonBulkPrice: pricing.nonBulkPrice,
      bulkPrice: pricing.bulkPrice,
      bulkThreshold: pricing.bulkThreshold,
      lastModified: pricing.lastModified,
    });

    res.status(200).json({
      success: true,
      pricing: {
        nonBulkPrice: pricing.nonBulkPrice,
        bulkPrice: pricing.bulkPrice,
        bulkThreshold: pricing.bulkThreshold,
        lastModified: pricing.lastModified,
      },
    });
  } catch (error) {
    logger.error('Error retrieving global pricing: ', error);
    return next(createError(500, 'Internal server error'));
  }
});

// @desc    Set or update global DID pricing
// @route   POST /api/v1/dids/pricing/global
// @access  Private (Admin)
exports.setGlobalPricing = catchAsyncErrors(async (req, res, next) => {
  const { nonBulkPrice, bulkPrice, bulkThreshold } = req.body;

  // Check if required fields are present
  if (!nonBulkPrice || !bulkPrice || !bulkThreshold) {
    logger.warn('Missing required fields for setting global pricing', { body: req.body });
    return next(createError(400, 'nonBulkPrice, bulkPrice, and bulkThreshold are required fields'));
  }

  try {
    let pricing = await Pricing.findOne({ userId: null }); // Look for global pricing

    if (pricing) {
      // Update existing global pricing
      pricing.nonBulkPrice = nonBulkPrice;
      pricing.bulkPrice = bulkPrice;
      pricing.bulkThreshold = bulkThreshold;
      pricing.lastModified = Date.now();
      await pricing.save();

      logger.info('Updated global pricing successfully:', {
        nonBulkPrice,
        bulkPrice,
        bulkThreshold,
      });
    } else {
      // Create new global pricing if none exists
      pricing = new Pricing({
        userId: null, // Setting userId to null for global pricing
        nonBulkPrice,
        bulkPrice,
        bulkThreshold,
        lastModified: Date.now(),
      });
      await pricing.save();

      logger.info('Created new global pricing successfully:', {
        nonBulkPrice,
        bulkPrice,
        bulkThreshold,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Global pricing updated successfully',
      pricing,
    });
  } catch (error) {
    logger.error('Error setting global pricing: ', error);
    return next(createError(500, 'Internal server error'));
  }
});


// @desc    Get DID pricing for a specific user
// @route   GET /api/v1/dids/pricing/user/:userId
// @access  Private (Admin)
exports.getUserPricing = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      logger.warn(`User not found: ${req.params.userId}`);
      return next(createError(404, 'User not found'));
    }

    // Fetch user-specific pricing if available
    const userPricing = await Pricing.findOne({ userId: user._id });
    // Fetch global pricing
    const globalPricing = await Pricing.findOne({ userId: null });

    if (!globalPricing) {
      logger.warn('No global pricing data found');
      return next(createError(404, 'No global pricing data found'));
    }

    // Construct pricing response
    const pricing = {
      nonBulkPrice: userPricing ? userPricing.nonBulkPrice : globalPricing.nonBulkPrice,
      bulkPrice: userPricing ? userPricing.bulkPrice : globalPricing.bulkPrice,
      bulkThreshold: userPricing ? userPricing.bulkThreshold : globalPricing.bulkThreshold,
    };

    logger.info('Fetched user pricing successfully for user:', {
      user: user._id,
      pricing,
    });

    res.status(200).json({
      success: true,
      user: user._id,
      pricing,
    });
  } catch (error) {
    logger.error('Error retrieving user pricing: ', error);
    return next(createError(500, 'Internal server error'));
  }
});

// @desc    Set or update DID pricing for a specific user
// @route   POST /api/v1/dids/pricing/user/:userId
// @access  Private (Admin)
exports.setUserPricing = catchAsyncErrors(async (req, res, next) => {
  const { nonBulkPrice, bulkPrice, bulkThreshold } = req.body;

  // Check if required fields are present
  if (!nonBulkPrice || !bulkPrice || !bulkThreshold) {
    logger.warn('Missing required fields for setting user-specific pricing', { body: req.body });
    return next(createError(400, 'nonBulkPrice, bulkPrice, and bulkThreshold are required fields'));
  }

  try {
    let user = await User.findById(req.params.userId);

    if (!user) {
      logger.warn(`User not found: ${req.params.userId}`);
      return next(createError(404, 'User not found'));
    }

    // Check if user-specific pricing already exists
    let userPricing = await Pricing.findOne({ userId: user._id });

    if (userPricing) {
      // Update existing user-specific pricing
      userPricing.nonBulkPrice = nonBulkPrice || userPricing.nonBulkPrice;
      userPricing.bulkPrice = bulkPrice || userPricing.bulkPrice;
      userPricing.bulkThreshold = bulkThreshold || userPricing.bulkThreshold;
      userPricing.lastModified = Date.now(); // Update last modified date
      await userPricing.save();

      logger.info('Updated user-specific pricing successfully for user:', {
        user: user._id,
        pricing: {
          nonBulkPrice: userPricing.nonBulkPrice,
          bulkPrice: userPricing.bulkPrice,
          bulkThreshold: userPricing.bulkThreshold,
        },
      });
    } else {
      // Create new pricing document for the user
      userPricing = new Pricing({
        userId: user._id,
        nonBulkPrice,
        bulkPrice,
        bulkThreshold,
        lastModified: Date.now(), // Set last modified date
      });
      await userPricing.save();

      logger.info('Created new user-specific pricing successfully for user:', {
        user: user._id,
        pricing: {
          nonBulkPrice,
          bulkPrice,
          bulkThreshold,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'User-specific pricing updated successfully',
      userPricing,
    });
  } catch (error) {
    logger.error('Error setting user pricing: ', error);
    return next(createError(500, 'Internal server error'));
  }
});

