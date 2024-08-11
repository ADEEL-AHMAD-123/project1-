const BillingSwitchServer = require('../services/BillingSwitchServer');
const createError = require('http-errors');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const User = require('../models/user');
const SIPDetails = require('../models/SIPDetails');
const BillingAccount = require('../models/BillingAccount');
const apiKey = process.env.SWITCH_BILLING_API_KEY;
const apiSecret = process.env.SWITCH_BILLING_API_SECRET;
const { fetchAllPages, fetchDataFromMongoDB, storeDataInMongoDB,generateRandomPin } = require('../utils/helperFunctions');
const moment = require('moment');
const CallSummary = require('../models/CallSummary'); 


const billingSwitchServer = new BillingSwitchServer(apiKey, apiSecret);



// @desc    Create a new resource
// @route   POST /api/v1/billing/create
// @access  Private
exports.createResource = catchAsyncErrors(async (req, res, next) => {
  const { module } = req.query; // Get the module from query

  if (!module) {
    return next(createError(400, 'Module is required'));
  }

  // Validate module
  if (!['sip', 'user'].includes(module)) {
    return next(createError(400, 'Invalid module specified'));
  }

  // Fetch current logged-in user
  const user = await User.findById(req.user._id); // Assuming req.user._id is set by authentication middleware
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Prepare data for API call
  const username = `${user.firstName}-${user.lastName}`; // Construct username from first name and last name
  const apiData = {
    username: 'aadeiii1',
    password: '11111111', // Static password
    id_group: 3, // Assuming this is a default or static value
    callingcard_pin: generateRandomPin() // Generate or get a calling card pin
  };

  try {
    // Make API call
    const result = await billingSwitchServer.create(module, apiData);
    console.log('API result:', result); // Log the result for debugging

    // Check for API call success
    if (result && result.success) {
      let storedData;

      // Access the first item in the rows array
      const apiDataToStore = result.rows[0];

      try {
        // Store in the appropriate model based on module
        if (module === 'sip') {
          storedData = await SIPDetails.create({
            ...apiDataToStore, // Store all fields from the API response
            user_id: user._id
          });
        } else if (module === 'user') {
          storedData = await BillingAccount.create({
            ...apiDataToStore, // Store all fields from the API response
            user_id: user._id
          });
        }
      } catch (dbError) {
        console.error('Error storing data in DB:', dbError);
        return next(createError(500, 'Failed to store data in DB'));
      }

      // Log the resource creation
      logger.info('Resource created', {
        module,
        result: storedData
      });

      return res.status(201).json({
        success: true,
        message: `${module.charAt(0).toUpperCase() + module.slice(1)} created successfully`,
        data: storedData
      });
    } else {
      // Log the entire result for debugging
      const errorMessage = result.errors ? Object.values(result.errors).flat().join(', ') : 'Unknown error occurred';
      logger.error('Resource creation failed', {
        module,
        result, // Include result for detailed debugging
        error: errorMessage
      });

      return res.status(400).json({
        success: false,
        message: 'Failed to create resource',
        error: errorMessage
      });
    }
  } catch (err) {
    // Handle other errors
    logger.error('API call failed', {
      module,
      error: err.message
    });

    return next(createError(500, 'Internal Server Error'));
  }
});


// @desc    Get all resources
// @route   GET /api/v1/billing/resources
// @access  Private
exports.getAllResources = catchAsyncErrors(async (req, res, next) => {
  const { module, page = 1, limit = 10 } = req.query;

  if (!module) {
    throw createError(400, 'Module is required');
  }

  // Set up pagination
  const skip = (page - 1) * limit;
  const limitNumber = parseInt(limit);

  // Define the collection to query based on the 'module' parameter
  let collection;
  switch (module) {
    case 'billing_accounts':
      collection = BillingAccount;
      break;
    // Add more cases for other modules/collections if necessary
    default:
      throw createError(400, 'Invalid module');
  }

  // Get the total count of documents
  const totalCount = await collection.countDocuments();

  // Fetch the data from the MongoDB collection
  const result = await collection.find().skip(skip).limit(limitNumber);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limitNumber);

  res.status(200).json({
    success: true,
    data: result,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: limitNumber,
      totalPages: totalPages,
    },
  });
});


// @desc    Get a single resource by ID
// @route   GET /api/v1/billing/resources/:id
// @access  Private
exports.getResourceById = catchAsyncErrors(async (req, res, next) => {
  const { module } = req.query;
  const { id } = req.params;

  if (!module) {
    return next(createError(400, 'Module is required'));
  }

  if (!id) {
    return next(createError(400, 'ID is required'));
  }

  // Define the collection to query based on the 'module' parameter
  let collection;
  switch (module) {
    case 'billing_accounts':
      collection = BillingAccount;
      break;
    // Add more cases for other modules/collections if necessary
    default:
      return next(createError(400, 'Invalid module'));
  }

  // Fetch the data by ID from the MongoDB collection
  const resource = await collection.findById(id);

  if (!resource) {
    return next(createError(404, `Resource not found with id of ${id}`));
  }

  res.status(200).json({
    success: true,
    data: resource,
  });
});

// @desc    Update a resource by ID
// @route   PUT /api/v1/billing/resources/:id
// @access  Private
exports.updateResource = catchAsyncErrors(async (req, res, next) => {
  const { module, data } = req.body;
  const { id } = req.params;

  if (!module || !data || !id) {
    return next(createError(400, 'Module, data, and ID are required'));
  }

  // Define the collection to query based on the 'module' parameter
  let collection;
  let idField;
  switch (module) {
    case 'sip':
      collection = SIPDetails;
      idField = 'sip_id'; // Assuming the field in the SIPDetails collection
      break;
    case 'user':
      collection = BillingAccount;
      idField = 'user_id'; // Assuming the field in the BillingAccount collection
      break;
    default:
      return next(createError(400, 'Invalid module specified'));
  }

  try {
    // Fetch the resource from MongoDB using the provided ID
    const resource = await collection.findById(id);

    if (!resource) {
      return next(createError(404, `Resource not found with id of ${id}`));
    }

    // Retrieve the ID field for the third-party server
    const thirdPartyId = resource[idField];

    if (!thirdPartyId) {
      return next(createError(404, `Third-party ID not found for resource with id of ${id}`));
    }

    // Update the resource on the third-party server
    const apiResult = await billingSwitchServer.update(module, thirdPartyId, data);

    if (!apiResult || !apiResult.success) {
      const errorMessage = apiResult.errors ? Object.values(apiResult.errors).flat().join(', ') : 'Failed to update resource on third-party server';
      logger.error('Third-party server update failed', {
        module,
        thirdPartyId,
        error: errorMessage
      });
      return next(createError(400, errorMessage));
    }

    // Update the resource in MongoDB
    const updatedResource = await collection.findByIdAndUpdate(id, data, { new: true });

    if (!updatedResource) {
      return next(createError(404, `Resource not found with id of ${id}`));
    }

    // Log the resource update
    logger.info('Resource updated successfully', {
      module,
      id,
      result: updatedResource
    });

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource,
    });
  } catch (err) {
    // Handle other errors
    logger.error('Error updating resource', {
      module,
      id,
      error: err.message
    });
    return next(createError(500, 'Internal Server Error'));
  }
});


// @desc    Delete a resource by ID
// @route   DELETE /api/v1/billing/resources/:id
// @access  Private
exports.deleteResource = catchAsyncErrors(async (req, res, next) => {
  const { module } = req.query;
  if (!module) {
    throw createError(400, 'Module is required');
  }

  const result = await billingSwitchServer.destroy(module, req.params.id);

  if (!result) {
    return next(createError(404, `Resource not found with id of ${req.params.id}`));
  }

 if(result.success != true){
  logger.error('Resource deletion failed', {
    module,
    result,
  });
  return res.status(500).json({
    success: false,
    message: 'Resource deletion failed',
    result 
  });
}


  logger.info('Resource deleted', {
    module,
    result,
  });

  res.status(200).json({
    success: true, 
    message: 'Resource deleted successfully',
    result
  });
});



// @desc    Get records based on id and date range
// @route   GET /api/v1/summary/days
// @access  Private
exports.getAllDays = catchAsyncErrors(async (req, res, next) => {
  const { id, startDate: startDateParam, endDate: endDateParam, page = 1 } = req.query;

  const today = moment().startOf('day').format('YYYY-MM-DD'); // Format as string
  const yesterday = moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD'); // Yesterday's date

  let startDate, endDate;

  try {
    if (startDateParam) {
      startDate = moment(startDateParam).format('YYYY-MM-DD');

      if (endDateParam) {
        endDate = moment(endDateParam).format('YYYY-MM-DD');

        if (moment(startDate).isAfter(endDate)) {
          return next(createError(400, `Start date cannot be after end date: ${startDateParam} to ${endDateParam}`));
        }

        if (moment(startDate).isSame(endDate)) {
          return next(createError(400, `Start date and end date cannot be the same: ${startDateParam}`));
        }

        if (moment(startDate).isAfter(today) || moment(endDate).isAfter(today)) {
          return next(createError(400, `Date range cannot be in the future: ${startDateParam} to ${endDateParam}`));
        }
      } else {
        endDate = yesterday; // Default end date to yesterday if not provided
      }
    } else {
      startDate = null;
      endDate = null; // No date range filter
    }
  } catch (err) {
    return next(createError(400, `Invalid date format: ${err.message}`));
  }

  const includesToday = startDate && endDate && moment(startDate).isBefore(today) && moment(endDate).isSameOrAfter(today);

  const limit = 10; // Define limit as needed
  const skip = (page - 1) * limit;

  try {
    let result;

    if (includesToday) {
      result = await fetchAllPages('callSummaryDayUser'); // Fetch all pages
      logger.info(`Data fetched from third-party server for date range ${startDateParam} to ${endDateParam}`);

      await storeDataInMongoDB(result);
      result = await fetchDataFromMongoDB({ startDate, endDate, id, skip, limit, page }); // Re-fetch from MongoDB
    } else {
      result = await fetchDataFromMongoDB({ startDate, endDate, id, skip, limit, page });
    }

    return res.status(200).json({
      success: true,
      result
    });

  } catch (err) {
    logger.error(`Internal Server Error: ${err.message}`, {
      error: err,
      request: {
        ip: req.ip,
        method: req.method,
        path: req.path,
        query: req.query
      }
    });
    return next(createError(500, `Internal Server Error: ${err.message}`));
  }
});

// @desc    Get all months records
// @route   GET /api/v1/summary/month
// @access  Private
exports.getAllMonths = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, id_user, month } = req.query;

  if (id_user) {
    billingSwitchServer.setFilter('id_user', id_user, 'eq', 'numeric');
  }

  if (month) {
    billingSwitchServer.setFilter('month', month, 'eq', 'date');
  }

  let result;
  if (page === "all") {
    result = await fetchAllPages('callSummaryMonthUser');
  } else {
    result = await billingSwitchServer.read('callSummaryMonthUser', page);
  }

  billingSwitchServer.clearFilter();

  res.status(200).json({
    success: true,
    result,
  });
});
