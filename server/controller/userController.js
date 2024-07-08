const User = require("../model/user");
const createError = require("http-errors");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const logger = require("../utils/logger");
const sendToken = require("../utils/sendToken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Memory storage for multer

// @desc    Get current logged-in user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    logger.error("User not found", { ip: req.ip, userId: req.user.id });
    throw createError(404, "User not found");
  }

  logger.info("Fetched user profile", {
    ip: req.ip,
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update current logged-in user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log('hit profile');
    const { phone, zipcode, address } = req.body;
    let avatar;

    if (req.file) {
      const base64String = req.file.buffer.toString("base64"); // Convert buffer to base64 string
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64String}`,
        {
          folder: "avatars", // Optional folder for organizing images
        }
      );
      avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const updates = {
      phone,
      zipcode,
      address,
      ...(avatar && { avatar }),
    };

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!user) {
      logger.error("User not found for update", {
        ip: req.ip,
        userId: req.user.id,
      });
      throw createError(404, "User not found");
    }

    logger.info("Updated user profile", {
      ip: req.ip,
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(createError(500, error.message || "Internal Server Error"));
  }
});

// @desc    Update user's own SSH keys (public key only)
// @route   PUT /api/user/sshkeys
// @access  Private (admin and supportiveStaff)
exports.updateSSHKeys = catchAsyncErrors(async (req, res, next) => {
  const { publicKey } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    logger.error("User not found for SSH keys update", {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(404, "User not found");
  }

  // Only allow admin and supportive staff to update their own SSH keys
  if (req.user.role !== "admin" && req.user.role !== "supportive staff") {
    logger.error("Unauthorized attempt to update SSH keys", {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(403, "You do not have permission to update SSH keys");
  }

  const isAdded = !user.sshKeys.publicKey;

  // Update the user's public SSH key
  user.sshKeys.publicKey = publicKey;
  await user.save();

  const action = isAdded ? "added" : "updated";
  logger.info(`Public SSH key ${action} for user ${user._id}`, {
    ip: req.ip,
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: `Public SSH key ${action} successfully`,
    user,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin and supportive staff)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  let users;

  if (req.user.role === "admin") {
    users = await User.find();
  } else if (req.user.role === "supportiveStaff") {
    users = await User.find({ role: "client" });
  } else {
    logger.error("Unauthorized attempt to access all users", {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(
      403,
      "You do not have permission to access this resource"
    );
  }

  logger.info("Fetched all users", {
    ip: req.ip,
    requesterId: req.user.id,
    role: req.user.role,
  });

  res.status(200).json({
    success: true,
    users,
  });
});

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private (admin only)
exports.getUserById = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
console.log('hid single');
  if (!user) {
    logger.error("User not found by ID", { ip: req.ip, userId: req.params.id });
    throw createError(404, "User not found");
  }

  logger.info("Fetched user by ID", {
    ip: req.ip,
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    user,
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
    sshKeys: req.body.sshKeys,
  };

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    logger.error("User not found for admin update", {
      ip: req.ip,
      userId: req.params.id,
    });
    throw createError(404, "User not found");
  }

  logger.info("User updated by admin", {
    ip: req.ip,
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Delete user by admin
// @route   DELETE /api/users/:id
// @access  Private (admin only)
exports.deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    logger.error("User not found for deletion", {
      ip: req.ip,
      userId: req.params.id,
    });
    throw createError(404, "User not found");
  }

  await user.remove();

  logger.info("User deleted by admin", { ip: req.ip, userId: req.params.id });

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Private
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const { oldPassword, newPassword, confirmPassword } = req.body;
console.log(req.body,'kk');
  if (!oldPassword || !newPassword || !confirmPassword) {
    logger.error("Required fields missing for password update", {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(
      400,
      "Old password, new password, and confirmPassword are required"
    );
  }

  if (!(await user.matchPassword(oldPassword))) {
    logger.error("Old password is incorrect", {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(400, "Old password is incorrect");
  }

  if (newPassword !== confirmPassword) {
    logger.error("New password and confirmPassword do not match", {
      ip: req.ip,
      userId: req.user.id,
    });
    throw createError(400, "New password and confirmPassword do not match");
  }

  user.password = newPassword;
  await user.save();

  logger.info("User password updated", {
    ip: req.ip,
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc    Logout user
// @route   POST /api/user/logout
// @access  Private
exports.logout = catchAsyncErrors(async (req, res, next) => {
  // Clear the cookie containing the token
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  logger.info("User logged out", {
    ip: req.ip,
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get all team members
// @route   GET /api/users/team
// @access  Private (admin and supportive staff)
exports.getTeamMembers = catchAsyncErrors(async (req, res, next) => {
console.log('hit team');

  const roles = ["admin", "supportive staff"];
  const teamMembers = await User.find({ role: { $in: roles } });

  if (!teamMembers) {
    logger.error("No team members found", { ip: req.ip, userId: req.user.id });
    throw createError(404, "No team members found");
  }

  logger.info("Fetched all team members", {
    ip: req.ip,
    requesterId: req.user.id,
    role: req.user.role,
  });

  res.status(200).json({
    success: true,
    teamMembers,
  });
});

