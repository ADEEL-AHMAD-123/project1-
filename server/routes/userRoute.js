const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  updateSSHKeys,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
  verifyEmail
} = require('../controller/userController');
const { isAuthenticatedUser, authorize } = require("../middleware/auth");

const router = express.Router();

router.get('/profile', isAuthenticatedUser, getUserProfile);
router.put('/profile', isAuthenticatedUser, updateUserProfile);

router.put('/:id/ssh-keys', isAuthenticatedUser, authorize('admin', 'supportiveStaff'), updateSSHKeys);

router.get('/users', isAuthenticatedUser, authorize("admin","supportiveStaff"), getAllUsers);
router.get('/:id', isAuthenticatedUser, authorize("admin", "supportiveStaff"), getUserById);
router.put('/:id', isAuthenticatedUser, authorize("admin"), updateUserByAdmin);
router.delete('/users/:id', isAuthenticatedUser, authorize("admin"), deleteUserByAdmin);

module.exports = router;
