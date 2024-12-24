const express = require('express');
const { registerUser, loginUser,verifyEmail,resendVerificationEmail} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-verification', resendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
   