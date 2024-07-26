const Vendor = require('../models/vendor');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');
const logger = require('../utils/logger');

// @desc    Create a new vendor
// @route   POST /api/v1/vendors/create
// @access  Private
exports.createVendor = catchAsyncErrors(async (req, res, next) => {
  const { providerName, providerId, apiEndpointUrl, website, startDate, status } = req.body;

  // Validate request body
  if (!providerName || !providerId || !apiEndpointUrl) {
    throw createError(400, 'Provider name, provider ID, and API endpoint URL are required');
  }

  const newVendor = new Vendor({
    providerName,
    providerId,
    apiEndpointUrl,
    website,
    startDate,
    status,
  });

  await newVendor.save();

  // Log the vendor creation
  logger.info('Vendor created', {
    vendorId: newVendor._id.toString(),
    providerName: newVendor.providerName,
    apiEndpointUrl: newVendor.apiEndpointUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Vendor created successfully',
    vendor: newVendor,
  });
});

// @desc    Get all vendors
// @route   GET /api/v1/vendors
// @access  Private
exports.getAllVendors = catchAsyncErrors(async (req, res, next) => {
  const vendors = await Vendor.find();

  res.status(200).json({
    success: true,
    count: vendors.length,
    vendors,
  });
});

// @desc    Get a single vendor by ID
// @route   GET /api/v1/vendors/:id
// @access  Private
exports.getVendorById = catchAsyncErrors(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(createError(404, `Vendor not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    vendor,
  });
});

// @desc    Update a vendor by ID
// @route   PUT /api/v1/vendors/:id
// @access  Private
exports.updateVendor = catchAsyncErrors(async (req, res, next) => {
  const { providerName, apiEndpointUrl, website, startDate, status } = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { providerName, apiEndpointUrl, website, startDate, status },
    { new: true, runValidators: true }
  );

  if (!vendor) {
    return next(createError(404, `Vendor not found with id of ${req.params.id}`));
  }

  // Log the vendor update
  logger.info('Vendor updated', {
    vendorId: vendor._id.toString(),
    providerName: vendor.providerName,
    apiEndpointUrl: vendor.apiEndpointUrl,
  });

  res.status(200).json({
    success: true,
    message: 'Vendor updated successfully',
    vendor,
  });
});

// @desc    Delete a vendor by ID
// @route   DELETE /api/v1/vendors/:id
// @access  Private
exports.deleteVendor = catchAsyncErrors(async (req, res, next) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);

  if (!vendor) {
    return next(createError(404, `Vendor not found with id of ${req.params.id}`));
  }

  // Log the vendor deletion
  logger.info('Vendor deleted', {
    vendorId: vendor._id.toString(),
    providerName: vendor.providerName,
  });

  res.status(200).json({
    success: true,
    message: 'Vendor deleted successfully',
  });
});
