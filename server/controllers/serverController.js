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


// @desc    Get all servers (admin only)
// @route   GET /api/v1/servers
// @access  Private (admin)
exports.getAllServersByAdmin = catchAsyncErrors(async (req, res, next) => {
  const servers = await Server.find().populate('companyUser', 'firstName lastName');

  res.status(200).json({
    success: true,
    count: servers.length,
    servers,
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

// @desc    Get all servers for logged-in user
// @route   GET /api/v1/servers/user
// @access  Private
exports.getAllServersForUser = catchAsyncErrors(async (req, res, next) => {

  const userId = req.user.id; 


  const servers = await Server.find({ 'companyUser._id': userId });

  if (!servers) {
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
    count: servers.length,
    servers,
  });
});


 