const User = require("../models/user");
const sendToken = require("../utils/sendToken");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const createError = require("http-errors");
const sendEmail = require("../utils/sendEMail");
const crypto = require("crypto");
const generateEmailTemplate = require("../utils/generateEmailTemplate");


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, phone, whatsapp } = req.body;

  const userExist = await User.findOne({ email });

  if (userExist) {
    throw createError(409, "User with this email already exists. Please login to continue.");
    // If the email is verified, throw an error for user already existing
    // if (userExist.isEmailVerified) {
    //   throw createError(409, "User with this email already exists. Please login to continue.");
    // }

    // If the email is unverified, check if the grace period has expired
    // const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours
    // const isExpired =
    //   Date.now() - new Date(userExist.createdAt).getTime() > gracePeriod;

    // If the email is unverified and grace period has not expired, throw error
    // if (!isExpired) {
    //   throw createError(409, "User with this email already exists. Please login to continue.");
    // }

    // If the grace period has expired, remove the unverified user and allow new registration
    // await userExist.remove();  // Remove the expired unverified user
  }

  // Proceed with creating a new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    phone,
    whatsapp,
  });
  // const emailVerificationToken = user.getEmailVerificationToken();
  await user.save();

  // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}?fromVerificationLink=true`;
  // const emailTemplate = generateEmailTemplate("emailVerification", {
  //   verificationUrl,
  //   firstName,
  // });

  // try {
  //   await sendEmail({
  //     email: user.email,
  //     subject: emailTemplate.subject,
  //     message: emailTemplate.message,
  //   });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
    });
  // } catch (error) {
  //   user.emailVerificationToken = undefined;
  //   user.emailVerificationExpires = undefined;
  //   await user.save();
  //   throw createError(500, "Email could not be sent");
  // }
});


// @desc    Verify E-mail for registration
// @route   POST /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    throw createError(400, "No verification token provided");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw createError(400, "Invalid or expired token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    verified: true,
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

  // Find user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw createError(404, "User with this email does not exist");
  }

  // Validate password
  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect) {
    throw createError(401, "Incorrect password");
  }

  // Check email verification
  
//   if (!user.isEmailVerified) {


// // Check rate limit for sending verification email
// const rateLimitDuration = 1 * 60 * 1000; // 1 minute
// const lastVerificationSentAt = user.emailSentTimestamps.verification || 0;
// if (Date.now() - lastVerificationSentAt < rateLimitDuration) {
//   throw createError(429, 'Your email is not verified. You have recently requested a verification email. Please wait a while before trying again.');

// }

//     const emailVerificationToken = user.getEmailVerificationToken();
//     user.emailSentTimestamps = { verification: Date.now() };
//     await user.save();

//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}?fromVerificationLink=true`;

//     const emailTemplate = generateEmailTemplate("emailVerification", {
//       firstName: user.firstName,
//       verificationUrl,
//     });


//     try {
//       // Try sending the verification email
//       await sendEmail({
//         email: user.email,
//         subject: "Email Verification",
//         message: emailTemplate.message,
//       });
//     } catch (error) {
//       // If sending email fails, handle the error and log it
//       console.error("Error sending email:", error.message, error.stack);
//       user.emailVerificationToken = undefined;
//       user.emailVerificationExpires = undefined;
//       await user.save();
//     }

//     // After email is sent, throw the error that the email is not verified
//     throw createError(403, "Email not verified");
//   }

  // Capture IP
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];

  user.lastLoginIp = ip;
  await user.save();

  // Send token
  sendToken(user, 200, res, "Logged in successfully");
});

// @desc    Resend Email Verification Token
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw createError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw createError(404, "User not found with the provided email");
  }

  if (user.isEmailVerified) {
    throw createError(400, "Email is already verified");
  }

  const rateLimitDuration = 1 * 60 * 1000; // 1 minute
  const lastVerificationSentAt = user.emailSentTimestamps.verification || 0;
  if (Date.now() - lastVerificationSentAt < rateLimitDuration) {
    throw createError(429, 'You recently requested a verification email. Please wait a while before trying again.');
  }

  const emailVerificationToken = user.getEmailVerificationToken();
  user.emailSentTimestamps.verification = Date.now();
  await user.save();

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}?fromVerificationLink=true`;

  const emailTemplate = generateEmailTemplate("resendVerification", {
    verificationUrl,
    firstName: user.firstName,
  });

  try {
    await sendEmail({
      email: user.email,
      subject: emailTemplate.subject,
      message: emailTemplate.message,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully! Please check your inbox.",
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    console.error("Error sending verification email:", error.message);
    throw createError(500, "Verification email could not be sent");
  }
});
