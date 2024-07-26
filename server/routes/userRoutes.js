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
  getTeamMembers,
  logout,
  verifyEmail
} = require('../controllers/userController');
const { isAuthenticatedUser,isAuthorized } = require("../middlewares/auth");

const upload = require('../middlewares/multerConfig'); 

const router = express.Router(); 

router.get('/profile', isAuthenticatedUser, getUserProfile);
router.put('/profile', isAuthenticatedUser,upload.single('avatar'), updateProfile);
router.put('/password', isAuthenticatedUser, updatePassword);

router.put('/ssh-keys', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), updateSSHKeys);
router.post('/logout', isAuthenticatedUser, logout);
router.get('/users', isAuthenticatedUser, isAuthorized("admin", "supportiveStaff"), getAllUsers);

router.get('/team', isAuthenticatedUser, isAuthorized("admin", "supportive staff"), getTeamMembers);
router.get('users/:id', isAuthenticatedUser, isAuthorized("admin", "supportiveStaff"), getUserById);
router.delete('/users/:id', isAuthenticatedUser, isAuthorized("admin"), deleteUserByAdmin);
router.put('/:id', isAuthenticatedUser, isAuthorized("admin"), updateUserByAdmin);


module.exports = router;
