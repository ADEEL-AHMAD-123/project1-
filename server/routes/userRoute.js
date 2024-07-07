const express = require('express');
const {
  getUserProfile,
  updateProfile,
  updateSSHKeys,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
  updatePassword,
  verifyEmail
} = require('../controller/userController');
const { isAuthenticatedUser,isAuthorized } = require("../middleware/auth");

const upload = require('../middleware/multerConfig'); 

const router = express.Router(); 

router.get('/profile', isAuthenticatedUser, getUserProfile);
router.put('/profile', isAuthenticatedUser,upload.single('avatar'), updateProfile);
router.put('/password', isAuthenticatedUser, updatePassword);

router.put('/ssh-keys', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), updateSSHKeys);

router.get('/users', isAuthenticatedUser, isAuthorized("admin", "supportiveStaff"), getAllUsers);
router.get('/:id', isAuthenticatedUser, isAuthorized("admin", "supportiveStaff"), getUserById);
router.put('/:id', isAuthenticatedUser, isAuthorized("admin"), updateUserByAdmin);
router.delete('/users/:id', isAuthenticatedUser, isAuthorized("admin"), deleteUserByAdmin);

module.exports = router;
