const Server = require('../models/server');
const User = require('../models/user');
const Vendor = require('../models/vendor'); // Adjust the path as needed

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');
const logger = require('../utils/logger');

// @desc    Create a new server
// @route   POST /api/v1/servers/create
// @access  Private

exports.createServer = catchAsyncErrors(async (req, res, next) => {
  const {
    dialerSpecifications,
    dialerLocation,
    price,
    location,
    agentCredentials,
    adminCredentials,
    creatingFor,
    vendor, // This will contain the vendor ID
  } = req.body;
  const userId = req.user._id;

  let companyUser;
  let vendorDetails;

  // Check if 'creatingFor' is provided, else set it to the current user
  if (creatingFor) {
    companyUser = await User.findById(creatingFor).select('firstName lastName email');
    if (!companyUser) {
      throw createError(404, 'User for whom the server is being created not found');
    }
  } else {
    companyUser = req.user;
  }

  // Validate request body
  if (!agentCredentials.numberOfAgents || !agentCredentials.locationOfAgents) {
    throw createError(400, 'Number of agents and location of agents are required');
  }

  // Retrieve vendor information if vendor is provided
  if (vendor) {
    vendorDetails = await Vendor.findById(vendor).select('providerName');
    if (!vendorDetails) {
      throw createError(404, 'Vendor not found');
    }
  }

  // Get the count of servers created by the companyUser
  const serverCount = await Server.countDocuments({ 'companyUser._id': companyUser._id });
  const serverName = `${companyUser.firstName}-server-${serverCount + 1}`;

  // Create the server in an initializing state
  const newServer = new Server({
    serverName,
    dialerSpecifications: dialerSpecifications || {},
    price: price || {},
    location: location || {},
    agentCredentials,
    dialerLocation,
    adminCredentials: adminCredentials || {},
    companyUser: {
      _id: companyUser._id,
      firstName: companyUser.firstName,
      lastName: companyUser.lastName,
      email: companyUser.email,
    },
    vendor: vendorDetails ? {
      providerName: vendorDetails.providerName,
      _id: vendorDetails._id,
    } : undefined, // Include vendor info if available
    createdBy: userId,
    status: 'initializing', // Initial status
  });

  // Save the server
  await newServer.save();

  // Log the initializing activity
  newServer.activities.push({
    action: 'Server Initialized',
    details: `Server is being initialized by ${userId}`,
  });
  await newServer.save();

  // Determine the response message based on user role
  const responseMessage = req.user.role === 'client'
    ? 'Server initialization started successfully'
    : 'Server initialization started successfully';

  // Log only essential information
  logger.info('Server initialization', {
    serverId: newServer._id.toString(),
    createdBy: userId,
    companyUser: {
      _id: companyUser._id.toString(),
      firstName: companyUser.firstName,
      lastName: companyUser.lastName,
    },
    vendor: vendorDetails ? {
      _id: vendorDetails._id.toString(),
      providerName: vendorDetails.providerName,
    } : undefined,
    meta: {
      serverName: newServer.serverName,
      status: newServer.status,
      agentCredentials: {
        numberOfAgents: agentCredentials.numberOfAgents,
        locationOfAgents: agentCredentials.locationOfAgents,
      },
    },
  });

  res.status(201).json({
    success: true,
    message: responseMessage,
    server: newServer,
  });
});

// @desc    Get all servers (admin only) with filtering, pagination, and searching
// @route   GET /api/v1/servers
// @access  Private (admin)
exports.getAllServersByAdmin = catchAsyncErrors(async (req, res, next) => {
  // Destructure query parameters with default values for pagination
  const { page = 1, limit = 10, serverName, status, username, ipAddress, location, createdAt } = req.query;

  const query = {}; // Initialize the query object

  // Add server name filter (case-insensitive regex)
  if (serverName) {
    query.serverName = { $regex: new RegExp(serverName, 'i') }; // Match server name if provided
  }

  // Add status filter (exact match)
  if (status) {
    query.status = status; // Match status if provided
  }

  // Add company user name filter (combining firstName and lastName in companyUser)
  if (username) {
    const nameRegex = new RegExp(username, 'i'); // Case-insensitive regex for username
    query.$or = [
      { 'companyUser.firstName': nameRegex },
      { 'companyUser.lastName': nameRegex },
    ];
  }

  // Add IP address filter (exact match on sipIpAddress in agentCredentials)
  if (ipAddress) {
    query['agentCredentials.sipIpAddress'] = { $regex: new RegExp(ipAddress, 'i') }; // Case-insensitive regex for IP
  }

  // Add location filter (city and/or country in dialerLocation)
  if (location) {
    const [city, country] = location.split(',').map(loc => loc.trim());

    query.$and = [];

    if (city) {
      query.$and.push({ 'dialerLocation.city': { $regex: new RegExp(city, 'i') } }); // Case-insensitive regex for city
    }
    if (country) {
      query.$and.push({ 'dialerLocation.country': { $regex: new RegExp(country, 'i') } }); // Case-insensitive regex for country
    }
  }

  // Optionally filter by creation date if provided
  if (createdAt) {
    const date = new Date(createdAt);
    query.createdAt = {
      $gte: date.setHours(0, 0, 0, 0), // Start of the day
      $lte: date.setHours(23, 59, 59, 999), // End of the day
    };
  }

  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  // Fetch servers with applied filters, pagination, and sorting
  const servers = await Server.find(query)
    .populate('companyUser', 'firstName lastName') // Populate company user info
    .skip(skip) // Skip the documents based on the page number
    .limit(parseInt(limit)) // Limit the number of documents returned
    .sort({ createdAt: -1 }); // Sort by creation date, newest first

  const totalItems = await Server.countDocuments(query); // Count total servers matching the query
  const totalPages = Math.ceil(totalItems / limit); // Calculate total pages

  res.status(200).json({
    success: true,
    servers,
    pagination: {
      totalItems,
      totalPages,
      limit: parseInt(limit),
      currentPage: parseInt(page),
    },
  });
});




// @desc    Get single server by ID
// @route   GET /api/v1/servers/:id
// @access  Private
exports.getServerById = catchAsyncErrors(async (req, res, next) => {
  const server = await Server.findById(req.params.id).populate('companyUser', 'firstName lastName');

  if (!server) {
    return next(createError(404, `Server not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    server,
  });
});

// @desc    Get all servers for logged-in user with filtering and pagination
// @route   GET /api/v1/servers/user
// @access  Private
exports.getAllServersForUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, serverName, status, ipAddress, location, createdAt } = req.query;

  const query = { 'companyUser._id': userId }; // Initialize query with user filter

  // Add server name filter (case-insensitive regex)
  if (serverName) {
    query.serverName = { $regex: new RegExp(serverName, 'i') };
  }

  // Add status filter
  if (status) {
    query.status = status;
  }

  // Add IP address filter (exact match on sipIpAddress in agentCredentials)
  if (ipAddress) {
    query['agentCredentials.sipIpAddress'] = { $regex: new RegExp(ipAddress, 'i') };
  }

  // Add location filter (city and/or country in dialerLocation)
  if (location) {
    const [city, country] = location.split(',').map(loc => loc.trim());
    query.$and = [];

    if (city) {
      query.$and.push({ 'dialerLocation.city': { $regex: new RegExp(city, 'i') } });
    }
    if (country) {
      query.$and.push({ 'dialerLocation.country': { $regex: new RegExp(country, 'i') } });
    }
  }

  // Optionally filter by creation date
  if (createdAt) {
    const date = new Date(createdAt);
    query.createdAt = {
      $gte: date.setHours(0, 0, 0, 0),
      $lte: date.setHours(23, 59, 59, 999),
    };
  }

  const skip = (page - 1) * limit;

  // Fetch servers with applied filters, pagination, and sorting
  const servers = await Server.find(query)
    .populate('companyUser', 'firstName lastName') // Populate company user info
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalItems = await Server.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  if (!servers.length) {
    logger.error('No servers found for user', {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(404, 'No servers found for user');
  }

  logger.info('Fetched servers for user', {
    ip: req.ip,
    userId: req.user.id,
    count: servers.length,
  });

  res.status(200).json({
    success: true,
    servers,
    pagination: {
      totalItems,
      totalPages,
      limit: parseInt(limit),
      currentPage: parseInt(page),
    },
  });
});



 