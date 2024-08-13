const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
