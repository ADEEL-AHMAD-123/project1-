const express = require("express");
const ErrorHandler = require("./middlewares/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const requestLogger = require("./middlewares/requestLogger");
const cloudinary = require('cloudinary').v2;
const Multer = require('multer');

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "config/.env" });
}

// Cors
app.use(cors({ 
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Trust proxy
app.set('trust proxy', true);

// Static files
app.use("/", express.static("uploads"));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Request logging middleware
app.use(requestLogger);

// Cookie and Body parsers
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// --- Stripe webhook route should use raw body parser ---
const orders = require('./routes/orderRoutes');
app.use('/api/v1/orders/payments/webhooks', express.raw({ type: 'application/json' }));

// JSON body parser for other routes
app.use(express.json());

// Import and use other routes
const auth = require("./routes/authRoutes");
const user = require("./routes/userRoutes");
const servers = require("./routes/serverRoutes");
const vendor = require("./routes/vendorRoutes");
const log = require("./routes/logRoutes");
const billing = require("./routes/billingRoutes");
const did = require("./routes/didRoutes");

app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/servers", servers);
app.use('/api/v1/vendors', vendor); 
app.use('/api/v1/log', log); 
app.use('/api/v1/billing', billing); 
app.use('/api/v1/dids', did);
app.use('/api/v1/orders', orders);

// Error handling middleware
app.use(ErrorHandler);

module.exports = app;
