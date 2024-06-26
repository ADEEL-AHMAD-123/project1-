const express = require('express');
const { registerUser, loginUser, manageSSHKeys, getUserData } = require('../controller/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/ssh-keys', authMiddleware(['admin', 'support']), manageSSHKeys);
router.get('/user-data', authMiddleware(['admin']), getUserData);

module.exports = router;
  