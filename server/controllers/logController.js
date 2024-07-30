const Log = require('../models/log');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require('http-errors');

// @desc    Get all logs with filtering, pagination, and sorting
// @route   GET /api/v1/logs
// @access  Private
exports.getAllLogs = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 10, level, startDate, endDate, ip } = req.query;

  const query = {};

  if (level) query.level = level;

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  if (ip) {
    query['meta.ip'] = { $regex: new RegExp(ip, 'i') }; // Case-insensitive regex match
  }

  const skip = (page - 1) * limit;

  const logs = await Log.find(query)
    .sort({ timestamp: -1 }) // Sort by newest first
    .skip(skip)
    .limit(parseInt(limit));

  const totalLogs = await Log.countDocuments(query);
  const totalPages = Math.ceil(totalLogs / limit);

  res.status(200).json({
    success: true,
    count: logs.length,
    totalLogs,
    totalPages,
    currentPage: parseInt(page),
    logs,
  });
});
