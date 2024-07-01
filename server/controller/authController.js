const User = require('../model/user');
const sendToken = require('../utils/sendToken');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const createError = require("http-errors");
const logger = require('../utils/logger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    throw createError(400, "User already exists");
  }

  const user = await User.create({ firstName, lastName, email, password });

  logger.info('User registered', {
    email: user.email,
    ip: req.ip,
    meta: {
      userId: user._id.toString(),
      email: user.email,
      ip: req.ip
    }
  });

  sendToken(user, 201, res, "Registration successful");
});


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw createError(401, "Invalid email or password");
  }

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  user.lastLoginIp = ip;
  await user.save();

  logger.info('User logged in', {
    email: user.email,
    meta: {
      userId: user._id.toString(),  // Convert ObjectId to string
      email: user.email,
      ip
    }
  });

  sendToken(user, 200, res, "Logged in successfully");
});
