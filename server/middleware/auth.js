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

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
      const error = createError(404, "User not found");
      return next(error);
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token"); // Clear the expired token from the cookies
      const tokenExpiredError = createError(401, "Token has expired. Please login again.");
      return next(tokenExpiredError);
    } else {
      const invalidTokenError = createError(500, "Invalid token");
      return next(invalidTokenError);
    }
  }
});

exports.isAuthorized = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw createError(403, `Role: ${req.user.role} is not allowed to access this resource`);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
