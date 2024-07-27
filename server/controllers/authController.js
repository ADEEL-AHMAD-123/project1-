const User = require('../models/user');
const sendToken = require('../utils/sendToken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const createError = require("http-errors");
const logger = require('../utils/logger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    throw createError(400, "User already exist");
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
  res.status(201).json({
    success: true,
    message: "Registration successful",
  });

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

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // Normalize IPv6 to IPv4 if necessary
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }
  
  user.lastLoginIp = ip;
  await user.save();

  logger.info('User logged in', {
    email: user.email,
    meta: {
      userId: user._id.toString(),  
      email: user.email,
      ip
    }
  });

  sendToken(user, 200, res, "Logged in successfully");
});
