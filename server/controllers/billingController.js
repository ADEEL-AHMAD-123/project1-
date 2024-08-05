const BillingSwitchServer = require('../services/BillingSwitchServer');
const createError = require('http-errors');
const logger = require('../utils/logger');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const apiKey = 'KEY-XxYVU7WxkDExD27lNFuU'; // Replace with your actual API key
const apiSecret = 'SECRET-ClBHdDz8eAZ4Ds4bDOIhHD32w'; // Replace with your actual API secret

const billingSwitchServer = new BillingSwitchServer(apiKey, apiSecret);

// @desc    Create a new resource
// @route   POST /api/v1/billing/create
// @access  Private
exports.createResource = catchAsyncErrors(async (req, res, next) => {
  const { module, data } = req.body;

  if (!module || !data) {
    throw createError(400, 'Module and data are required');
  }

  const result = await billingSwitchServer.create(module, data);

  // Log the resource creation
  logger.info('Resource created', {
    module,
    result,
  });

  res.status(201).json({
    success: true,
    message: 'Resource created successfully',
    result,
  });
});

// @desc    Get all resources
// @route   GET /api/v1/billing/resources
// @access  Private
exports.getAllResources = catchAsyncErrors(async (req, res, next) => {
  const { module, page } = req.query;
  if (!module) {
    throw createError(400, 'Module is required');
  }

  const result = await billingSwitchServer.read(module, page);

  res.status(200).json({
    success: true,
    result,
  });
});

// @desc    Get a single resource by ID
// @route   GET /api/v1/billing/resources/:id
// @access  Private
exports.getResourceById = catchAsyncErrors(async (req, res, next) => {
    const { module } = req.query;
    if (!module) {
      throw createError(400, 'Module is required');
    }
  
    const result = await billingSwitchServer.read(module, 1, 'read', {}, req.params.id);
  
    if (!result) {
      return next(createError(404, `Resource not found with id of ${req.params.id}`));
    }
    
    console.log(result, 'jhj');
    res.status(200).json({
      success: true,
      result,
    });
  });
  

// @desc    Update a resource by ID
// @route   PUT /api/v1/billing/resources/:id
// @access  Private
exports.updateResource = catchAsyncErrors(async (req, res, next) => {
  const { module, data } = req.body;

  if (!module || !data) {
    throw createError(400, 'Module and data are required');
  }

  const result = await billingSwitchServer.update(module, req.params.id, data);

  if (!result) {
    return next(createError(404, `Resource not found with id of ${req.params.id}`));
  }

  // Log the resource update
  logger.info('Resource updated', {
    module,
    result,
  });

  res.status(200).json({
    success: true,
    message: 'Resource updated successfully',
    result,
  });
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
