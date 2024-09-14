const express = require("express");
const ErrorHandler = require("./middlewares/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const requestLogger = require("./middlewares/requestLogger");
const cloudinary = require('cloudinary').v2;
const Multer = require('multer');
const { scheduleJobs } = require('./jobs/jobScheduler');
require('./utils/logScheduler');


app.use(cors({ 
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.set('trust proxy', true);


// Serve static files from 'uploads' directory
app.use("/", express.static("uploads"));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// Schedule background jobs
scheduleJobs(); // Initialize all scheduled jobs

// Use request logging middleware
app.use(requestLogger);

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ 
    path: "config/.env",
  });
}

// Import routes
const auth = require("./routes/authRoutes");
const user = require("./routes/userRoutes");
const servers = require("./routes/serverRoutes");
const vendor=require("./routes/vendorRoutes")
const log =require("./routes/logRoutes")
const billing =require("./routes/billingRoutes")
const did =require("./routes/didRoutes")
const order =require("./routes/orderRoutes")
const payment =require("./routes/paymentRoutes")

app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/servers", servers);
app.use('/api/v1/vendors', vendor); 
app.use('/api/v1/log' ,log) 
app.use('/api/v1/billing' ,billing) 
app.use('/api/v1/dids' ,did) 
app.use('/api/v1/order' ,order) 
app.use('/api/v1/payment' ,payment) 
 
// Error handling middleware
app.use(ErrorHandler);
 
module.exports = app;
