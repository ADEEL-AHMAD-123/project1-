const createError = require("http-errors");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    const error = createError(404, "Please login to access this resource");
    return next(error);
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decodedData.id);

  if (!req.user) {
    const error = createError(404, "User not found");
    return next(error);
  }

  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = createError(403, `Role: ${req.user.role} is not allowed to access this resource`);
      return next(error);
    }

    next();
  };
};
