const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Register new user
const registerUser = catchAsyncErrors(async (req, res) => {
  const { username, password, role } = req.body;
  const newUser = new User({ username, password, role });

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  newUser.ip = ip;

  await newUser.save();
  res.status(201).send('User registered successfully');
});

// Login user
const loginUser = catchAsyncErrors(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Incorrect username or password');
  }

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  user.ip = ip;
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Manage SSH keys
const manageSSHKeys = catchAsyncErrors(async (req, res) => {
  const { action, sshKey, oldKey, newKey } = req.body;
  const user = req.user;

  switch (action) {
    case 'add':
      user.sshKeys.push(sshKey);
      break;
    case 'delete':
      user.sshKeys = user.sshKeys.filter(key => key !== sshKey);
      break;
    case 'update':
      const index = user.sshKeys.findIndex(key => key === oldKey);
      if (index > -1) user.sshKeys[index] = newKey;
      break;
    default:
      return res.status(400).send('Invalid action');
  }

  await user.save();
  res.send(`SSH key ${action}ed successfully`);
});

// Get user data
const getUserData = catchAsyncErrors(async (req, res) => {
  const users = await User.find({}, 'username ip sshKeys');
  res.json(users);
});

module.exports = { registerUser, loginUser, manageSSHKeys, getUserData };
