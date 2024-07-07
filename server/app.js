const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const requestLogger = require("./middleware/requestLogger");
const cloudinary = require('cloudinary').v2;
const Multer = require('multer');

app.use(cors({
  origin: 'http://localhost:3000',
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

// Use request logging middleware
app.use(requestLogger);

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ 
    path: "config/.env",
  });
}

// Import routes
const auth = require("./routes/authRoute");
const user = require("./routes/userRoute");

app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);

// Error handling middleware
app.use(ErrorHandler);
 
module.exports = app;
