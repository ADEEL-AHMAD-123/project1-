const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  updateClientSSHKeys,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin 
} = require('../controller/userController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

router.put('/users/:id/ssh-keys', authMiddleware, authorize('admin', 'supportiveStaff'), updateClientSSHKeys);

router.get('/users', authMiddleware, authorize('admin'), getAllUsers);
router.get('/users/:id', authMiddleware, authorize('admin', 'supportiveStaff'), getUserById);
router.put('/users/:id', authMiddleware, authorize('admin'), updateUserByAdmin);
router.delete('/users/:id', authMiddleware, authorize('admin'), deleteUserByAdmin);

module.exports = router;
