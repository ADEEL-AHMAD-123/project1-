const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
  },
  email: { 
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: { 
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  emailSentTimestamps: {
    verification: { type: Date },
    passwordReset: { type: Date },
    // other email types will be added here when needed
  },
  phone: {
    type: String,
    default: null,
  },
  whatsapp: {
    type: String,
    default: null,
  },
  zipcode: {
    type: String,
  },
  address: {
    type: String,
  },
  avatar: {
    public_id: { type: String },
    url: { type: String }, 
  },
  role: {
    type: String,
    enum: ['client', 'supportive staff', 'admin'],
    default: 'client',
  },
  sshKeys: {
    publicKey: { type: String },
    privateKey: { type: String }
  },
  lastLoginIp: {
    type: String,
  },
  hasBillingAccount: {
    type: Boolean,
    default: false,
  },
  hasSipAccount: {
    type: Boolean,
    default: false,
  },
});


// Generate an email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 30 * 60 * 1000; // Token valid for 30 mins
  return token;
};

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



module.exports = mongoose.model('User', userSchema);
