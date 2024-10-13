const createError = require("http-errors");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(createError(404, "Please login to access this resource"));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
      return next(createError(404, "User not found"));
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token"); // Clear the expired token from the cookies
      return res.status(401).json({ message: "Token has expired. Please login again." });
    } else {
      return next(createError(401, "Invalid token"));
    }
  }
});

exports.isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, `Role: ${req.user?.role} is not allowed to access this resource`));
    }
    next();
  };
};
