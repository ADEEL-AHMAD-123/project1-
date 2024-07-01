const User = require('../model/user');
const createError = require('http-errors');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const logger = require('../utils/logger');
const sendToken = require('../utils/sendToken');

// @desc    Get current logged-in user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw createError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update current logged-in user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const updates = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,


  };

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  if (!user) {
    throw createError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// @desc    Admin & Supportive staff updating client user's SSH keys
// @route   PUT /api/user/:id/sshkeys
// @access  Private (admin and supportiveStaff)
exports.updateSSHKeys = catchAsyncErrors(async (req, res, next) => {
  const { sshKeys } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw createError(404, 'User not found');
  }

  if (req.user.role !== 'admin' && req.user.role !== 'supportiveStaff') {
    throw createError(403, 'You do not have permission to update this user');
  }

  if (user.role === 'admin' || user.role === 'supportiveStaff') {
    throw createError(403, 'You cannot update the profile of an admin or another supportive staff');
  }

  const existingSSHKeys = user.sshKeys || [];
  const isUpdated = existingSSHKeys.length > 0 && JSON.stringify(existingSSHKeys) !== JSON.stringify(sshKeys);

  user.sshKeys = sshKeys;
  await user.save();

  res.status(200).json({
    success: true,
    message: `SSH keys for user ${user._id} ${isUpdated ? 'updated' : 'added'} successfully`,
    user
  });
});


// @desc    Get all users 
// @route   GET /api/users
// @access  Private (admin and supportive staff)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  let users;

  if (req.user.role === 'admin') {
    users = await User.find();
  } else if (req.user.role === 'supportiveStaff') {
    users = await User.find({ role: 'client' });
  } else {
    throw createError(403, 'You do not have permission to access this resource');
  }

  res.status(200).json({
    success: true,
    users
  });
});


// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private (admin only)
exports.getUserById = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw createError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private (admin only)
exports.updateUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const updates = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
    sshKeys: req.body.sshKeys
    // Add other fields that admins can update
  };

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  if (!user) {
    throw createError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Delete user by admin
// @route   DELETE /api/users/:id
// @access  Private (admin only)
exports.deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw createError(404, 'User not found');
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});
