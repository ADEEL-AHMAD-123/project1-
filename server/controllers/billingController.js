const BillingSwitchServer = require("../services/BillingSwitchServer");
const createError = require("http-errors");
const logger = require("../utils/logger");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/user");
const SIPDetails = require("../models/SIPDetails");
const BillingAccount = require("../models/BillingAccount");
const moment = require("moment");
const { getBillingServer, fetchAllPages, fetchDataFromMongoDB, storeDataInMongoDB, generateRandomPin } = require('../utils/switchBillingHelpers');




// @desc    Create a billing account
// @route   POST /api/v1/billing/create-billing-account
// @access  Private
exports.createBillingAccount = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.query;

  // Fetch current logged-in user
  const user = await User.findById(req.user._id); // Assuming req.user._id is set by authentication middleware
  if (!user) {
    return next(createError(404, "User not found"));
  }

  // Prepare data for the API call
  const username = `${user.firstName}-${user.lastName}22`;
  const apiData = {
    username: username,
    password: "11111111",
    id_group: 3,
    credit: 0.00,
    active:1,
    callingcard_pin: generateRandomPin(),
  };

  const server = getBillingServer(type);

  try {
    // Make API call to create the billing account
    const result = await server.create("user", apiData);

    if (result && result.success) {
      const apiDataToStore = result.rows[0];

      try {
        // Store the billing account details in the database
        const storedData = await BillingAccount.create({
          ...apiDataToStore,
          user_id: user._id,
        });

        // Update the user document to indicate that the user now has a billing account
        await User.findByIdAndUpdate(user._id, { hasBillingAccount: true });

        logger.info("Billing account created", {
          user: user._id,
          storedData,
        });

        return res.status(201).json({
          success: true,
          message: "Billing account created successfully",
          data: storedData,
        });
      } catch (dbError) {
        console.error("Error storing billing account data in DB:", dbError);
        return next(createError(500, "Failed to store billing account data"));
      }
    } else {
      const errorMessage = result.errors
        ? Object.values(result.errors).flat().join(", ")
        : "Unknown error occurred";
      logger.error("Billing account creation failed", {
        user: user._id,
        error: errorMessage,
      });

      return res.status(400).json({
        success: false,
        message: "Failed to create billing account",
        error: errorMessage,
      });
    }
  } catch (err) {
    logger.error("Billing account API call failed", {
      user: user._id,
      error: err.message,
    });

    return next(createError(500, "Internal Server Error"));
  }
});

// @desc    Create a SIP account
// @route   POST /api/v1/billing/create-sip-account
// @access  Private
exports.createSIPAccount = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.query;

  // Fetch current logged-in user
  const user = await User.findById(req.user._id); // Assuming req.user._id is set by authentication middleware
  if (!user) {
    return next(createError(404, "User not found"));
  }

  // Prepare data for the API call
  const username = `${req.body.firstName}-${req.body.lastName}`;
  const apiData = {
    username: username,
    password: "11111111", // Static password
    id_group: 3, // Assuming this is a default or static value
    callingcard_pin: generateRandomPin(), // Generate or get a calling card pin
  };

  const server = getBillingServer(type);

  try {
    // Make API call to create the SIP account
    const result = await server.create("SIP", apiData);

    if (result && result.success) {
      const apiDataToStore = result.rows[0];

      try {
        // Store the SIP account details in the database
        const storedData = await SIPDetails.create({
          ...apiDataToStore,
          user_id: user._id,
        });

        logger.info("SIP account created", {
          user: user._id,
          storedData,
        });

        return res.status(201).json({
          success: true,
          message: "SIP account created successfully",
          data: storedData,
        });
      } catch (dbError) {
        console.error("Error storing SIP account data in DB:", dbError);
        return next(createError(500, "Failed to store SIP account data"));
      }
    } else {
      const errorMessage = result.errors
        ? Object.values(result.errors).flat().join(", ")
        : "Unknown error occurred";
      logger.error("SIP account creation failed", {
        user: user._id,
        error: errorMessage,
      });

      return res.status(400).json({
        success: false,
        message: "Failed to create SIP account",
        error: errorMessage,
      });
    }
  } catch (err) {
    logger.error("SIP account API call failed", {
      user: user._id,
      error: err.message,
    });

    return next(createError(500, "Internal Server Error"));
  }
});

// @desc    Get logged-in user's billing account
// @route   GET /api/v1/billing/account
// @access  Private
exports.getBillingAccount = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id; // Assuming req.user contains the authenticated user's info

  try {
    // Fetch the user's billing account from the BillingAccount collection
    const billingAccount = await BillingAccount.findOne({ user_id: userId });

    // If no billing account is found, return an error
    if (!billingAccount) {
      return next(createError(404, "Billing account not found for this user"));
    }

    res.status(200).json({
      success: true,
      data: billingAccount,
    });
  } catch (err) {
    logger.error("Error fetching billing account", {
      userId,
      error: err.message,
    });
    return next(createError(500, "Internal Server Error"));
  }
});

// @desc    Get all resources
// @route   GET /api/v1/billing/resources
// @access  Private
exports.getAllResources = catchAsyncErrors(async (req, res, next) => {
  const { module, type, page = 1, limit = 10 } = req.query;
  const server = getBillingServer(type);

  if (!module) {
    return next(createError(400, "Module is required"));
  }

  // Set up pagination
  const skip = (page - 1) * limit;
  const limitNumber = parseInt(limit);

  // Define the collection to query based on the 'module' parameter
  let collection;
  switch (module) {
    case "billing_accounts":
      collection = BillingAccount;
      break;
    // Add more cases for other modules/collections if necessary
    default:
      return next(createError(400, "Invalid module"));
  }

  try {
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
  } catch (err) {
    logger.error("Error fetching resources", {
      module,
      error: err.message,
    });
    return next(createError(500, "Internal Server Error"));
  }
});

// @desc    Get a single resource by ID
// @route   GET /api/v1/billing/resources/:id
// @access  Private
exports.getResourceById = catchAsyncErrors(async (req, res, next) => {
  const { module, type } = req.query;
  const { id } = req.params;
  const server = getBillingServer(type);

  if (!module) {
    return next(createError(400, "Module is required"));
  }

  if (!id) {
    return next(createError(400, "ID is required"));
  }

  // Define the collection to query based on the 'module' parameter
  let collection;
  switch (module) {
    case "billing_accounts":
      collection = BillingAccount;
      break;
    // Add more cases for other modules/collections if necessary
    default:
      return next(createError(400, "Invalid module"));
  }

  try {
    // Fetch the data by ID from the MongoDB collection
    const resource = await collection.findById(id);

    if (!resource) {
      return next(createError(404, `Resource not found with id of ${id}`));
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    logger.error("Error fetching resource by ID", {
      module,
      id,
      error: err.message,
    });
    return next(createError(500, "Internal Server Error"));
  }
});

// @desc    Update a resource by ID
// @route   PUT /api/v1/billing/resources/:id
// @access  Private
exports.updateResource = catchAsyncErrors(async (req, res, next) => {
  const { module, data, type } = req.body;
  const { id } = req.params;
  const server = getBillingServer(type);

  if (!module || !data || !id) {
    return next(createError(400, "Module, data, and ID are required"));
  }

  // Define the collection to query based on the 'module' parameter
  let collection;
  let idField;
  switch (module) {
    case "sip":
      collection = SIPDetails;
      idField = "sip_id"; // Assuming the field in the SIPDetails collection
      break;
    case "user":
      collection = BillingAccount;
      idField = "user_id"; // Assuming the field in the BillingAccount collection
      break;
    default:
      return next(createError(400, "Invalid module specified"));
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
      return next(
        createError(
          404,
          `Third-party ID not found for resource with id of ${id}`
        )
      );
    }

    // Update the resource on the third-party server
    const apiResult = await server.update(module, thirdPartyId, data);

    if (!apiResult || !apiResult.success) {
      return next(
        createError(400, `Failed to update resource on third-party server`)
      );
    }

    // Update the resource in MongoDB
    const updatedResource = await collection.findByIdAndUpdate(id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: updatedResource,
    });
  } catch (err) {
    logger.error("Error updating resource", {
      module,
      error: err.message,
    });
    next(createError(500, "Failed to update resource"));
  }
});

// @desc    Get records based on id and date range
// @route   GET /api/v1/summary/days
// @access  Private
exports.getAllDays = catchAsyncErrors(async (req, res, next) => {
  const {
    id,
    startDate: startDateParam,
    endDate: endDateParam,
    page = 1,
    type,
  } = req.query;
  const server = getBillingServer(type); // Get the correct server based on the type

  const today = moment().startOf("day").format("YYYY-MM-DD"); // Format as string
  const yesterday = moment()
    .subtract(1, "day")
    .startOf("day")
    .format("YYYY-MM-DD"); // Yesterday's date

  let startDate, endDate;

  try {
    if (startDateParam) {
      startDate = moment(startDateParam).format("YYYY-MM-DD");

      if (endDateParam) {
        endDate = moment(endDateParam).format("YYYY-MM-DD");

        if (moment(startDate).isAfter(endDate)) {
          return next(
            createError(
              400,
              `Start date cannot be after end date: ${startDateParam} to ${endDateParam}`
            )
          );
        }

        if (moment(startDate).isSame(endDate)) {
          return next(
            createError(
              400,
              `Start date and end date cannot be the same: ${startDateParam}`
            )
          );
        }

        if (
          moment(startDate).isAfter(today) ||
          moment(endDate).isAfter(today)
        ) {
          return next(
            createError(
              400,
              `Date range cannot be in the future: ${startDateParam} to ${endDateParam}`
            )
          );
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

  const includesToday =
    startDate &&
    endDate &&
    moment(startDate).isBefore(today) &&
    moment(endDate).isSameOrAfter(today);

  const limit = 10; // Define limit as needed
  const skip = (page - 1) * limit;

  try {
    let result;

    if (includesToday) {
      result = await server.read("callSummaryDayUser");

      await storeDataInMongoDB(result);
      result = await fetchDataFromMongoDB({
        startDate,
        endDate,
        id,
        skip,
        limit,
        page,
      });
      logger.info(
        `Data fetched from third-party server for date range ${startDateParam} to ${endDateParam}`
      );
    } else {
      result = await fetchDataFromMongoDB({
        startDate,
        endDate,
        id,
        skip,
        limit,
        page,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    logger.error(`Internal Server Error: ${err.message}`, {
      error: err,
      request: {
        ip: req.ip,
        method: req.method,
        path: req.path,
        query: req.query,
      },
    });
    return next(createError(500, `Internal Server Error: ${err.message}`));
  }
});

// @desc    Get all months records
// @route   GET /api/v1/summary/month
// @access  Private
exports.getAllMonths = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, id_user, month, type } = req.query;
  const billingSwitchServer = getBillingServer(type); // Get the correct server based on the type

  if (id_user) {
    billingSwitchServer.setFilter("id_user", id_user, "eq", "numeric");
  }

  if (month) {
    billingSwitchServer.setFilter("month", month, "eq", "date");
  }

  let result;
  try {
    if (page === "all") {
      result = await fetchAllPages("callSummaryMonthUser", billingSwitchServer);
    } else {
      result = await billingSwitchServer.read("callSummaryMonthUser", page);
    }

    billingSwitchServer.clearFilter();

    res.status(200).json({
      success: true,
      result,
    });
  } catch (err) {
    logger.error(`Internal Server Error: ${err.message}`, {
      error: err,
      request: {
        ip: req.ip,
        method: req.method,
        path: req.path,
        query: req.query,
      },
    });
    return next(createError(500, `Internal Server Error: ${err.message}`));
  }
});

// @desc    Delete a resource by ID
// @route   DELETE /api/v1/billing/resources/:id
// @access  Private
exports.deleteResource = catchAsyncErrors(async (req, res, next) => {
  const { module, type } = req.query;
  if (!module) {
    return next(createError(400, "Module is required"));
  }

  const billingSwitchServer = getBillingServer(type); // Get the correct server based on the type

  try {
    const result = await billingSwitchServer.destroy(module, req.params.id);

    if (!result) {
      return next(
        createError(404, `Resource not found with id of ${req.params.id}`)
      );
    }

    if (result.success !== true) {
      logger.error("Resource deletion failed", {
        module,
        result,
      });
      return res.status(500).json({
        success: false,
        message: "Resource deletion failed",
        result,
      });
    }

    logger.info("Resource deleted", {
      module,
      result,
    });

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      result,
    });
  } catch (err) {
    logger.error(`Internal Server Error: ${err.message}`, {
      error: err,
      request: {
        ip: req.ip,
        method: req.method,
        path: req.path,
        query: req.query,
      },
    });
    return next(createError(500, `Internal Server Error: ${err.message}`));
  }
});


// @desc    Fetch data from switchBilling server directly (no MongoDB)
// @route   GET /api/v1/billing/switch-data
// @access  Private
exports.fetchDataFromSwitchServer = catchAsyncErrors(async (req, res, next) => {
  const { module, type, page = 1, limit = 10, id } = req.query; // Extract query parameters
  const server = getBillingServer(type); // Get the appropriate server (inbound or outbound)

  server.clearFilter(); // Clear any previous filters
  server.setFilter("id", id, "eq", "numeric"); // Set filter for specific ID

  if (!module) {
    return next(createError(400, "Module is required"));
  }

  // Define the query parameters for the switchBilling API
  const queryParams = {
    page,
    limit,
    id
  };

  try {
    // Fetch data directly from the switchBilling server
    const apiResponse = await server.read(module, page);

    // Check if the API response is successful
    if (apiResponse) {
      logger.info("Data fetched from switchBilling server", { module });

      return res.status(200).json({
        success: true,
        data: apiResponse.rows,
        pagination: {
          total: apiResponse.count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } else {
      const errorMessage = apiResponse.errors
        ? Object.values(apiResponse.errors).flat().join(", ")
        : "Unknown error occurred";
        
      logger.error("Failed to fetch data from switchBilling server", {
        module,
        result: apiResponse,
        error: errorMessage,
      });

      return next(createError(400, "Failed to fetch data from switchBilling server"));
    }
  } catch (err) {
    // Handle any errors during the API call
    logger.error("Error fetching data from switchBilling server", { module, error: err.message });
    return next(createError(500, "Internal Server Error while fetching data from switchBilling server"));
  }
});


// @desc    Get specific user credit
// @route   GET /api/v1/billing/credit
// @access  Private
exports.getBillingAccountCredit = catchAsyncErrors(async (req, res, next) => {
  const { id_user, page = 1, type } = req.query;

  // Find the BillingAccount by id (mapped to id_user in the query)
  const billingAccount = await BillingAccount.findOne({ id: id_user });
  if (!billingAccount) {
    logger.error("Billing account not found", { id_user });
    return next(createError(404, "Billing account not found with the provided id."));
  }

  // Fetch the result from the appropriate billing server
  const billingServer = getBillingServer(type);
  try {
    billingServer.setFilter("id_user", id_user, "eq", "numeric");
    const result = await billingServer.read("refill", page);
    billingServer.clearFilter();

    // Check for different errors based on the response
    if (!result ||  !result.rows) {
      logger.error("Invalid response from billing server", { id_user, result });
      return next(createError(400, "Invalid response from billing server."));
    }

    if (result.response && result.response.status === 500) {
      logger.error("Internal server error from billing server", { id_user });
      return next(createError(500, "Internal server error from billing server."));
    }

    // Check if credit exists in the result
    const credit = result.rows[0]?.credit;
    if (credit === undefined) {
      logger.error("Credit information not found in the billing response", { id_user });
      return next(createError(400, "Credit information not found in the billing response."));
    }

    // Update the BillingAccount credit
    billingAccount.credit = credit; // Update the credit in BillingAccount
    await billingAccount.save(); // Save the updated BillingAccount

    // Respond with the billing credit and updated BillingAccount
    res.status(200).json({
      success: true,
      credit,
      billingAccount, // Return updated BillingAccount
    });
  } catch (err) {
    logger.error("Error fetching billing credit from server", { id_user, error: err.message });
    return next(createError(500, "Internal Server Error while fetching billing credit."));
  }
});

// @desc    Create new credit record
// @route   POST /api/v1/billing/credit
// @access  Private
exports.updateBillingAccountCredit = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.query;
  const { id_user, credit, description } = req.body;

  // Fetch the result from the appropriate billing server
  const billingServer = getBillingServer(type);
  
  try {
    // Fetch the BillingAccount from the database using the id_user
    const billingAccount = await BillingAccount.findOne({ user: id_user });
    
    // If no billing account is found, return an error
    if (!billingAccount) {
      logger.error("BillingAccount not found", { id_user });
      return next(createError(404, "BillingAccount not found."));
    }

    // Prepare data for refill request
    const refillData = {
      id_user,
      credit,
      payment: 1,
      description,
    };

    // Make request to the billing server
    const result = await billingServer.create("refill", refillData);

    // Handle invalid result from the billing server
    if (!result || result.success !== true) {
      logger.error("Invalid response from billing server during credit update", { id_user, result });
      return next(createError(400, "Invalid response from billing server during credit update."));
    }

    // Extract the new credit from the result's rows
    const newCredit = parseFloat(result.rows[0].credit);
    console.log(result.rows);

    // Update the BillingAccount credit with the new credit
    billingAccount.credit = newCredit;

    // Save the updated BillingAccount
    await billingAccount.save();

    // Log successful credit update
    logger.info("Billing credit updated successfully", { id_user, newCredit });

    // Respond with success message and updated BillingAccount
    res.status(200).json({
      success: true,
      message: "Billing credit updated successfully",
      billingAccount,
    });
  } catch (err) {
    logger.error("Error updating billing credit on server", { id_user, error: err.message });
    return next(createError(500, "Internal Server Error while updating billing credit."));
  }
});
 


 