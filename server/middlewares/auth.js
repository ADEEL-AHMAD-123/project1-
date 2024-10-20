const createError = require("http-errors");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // Check for token in cookies
  let token = req.cookies.token;

  // If the token is not in cookies, check headers
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If the token is not in cookies or headers, throw an error
  if (!token) {
    return next(createError(401, "Please login to access this resource"));
  }

  try {
    // Verify the token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
      return next(createError(404, "User not found"));
    }

    next(); // Token is valid, proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token"); // Clear expired token from cookies
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


exports.authenticaSSEconnection = async (req) => {
  const token = req.url.split('?token=')[1]; // Extract the token from query parameters

  if (!token) {
    throw createError(404, "Please login to access this resource");
  }
 
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedData.id);

    if (!user) {
      throw createError(404, "User not found");
    }

    return user; // Return the authenticated user
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw createError(401, "Token has expired. Please login again.");
    } else {
      throw createError(401, "Invalid token");
    }
  }
};
