const express = require('express');

const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');
const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');
 
const router = express.Router();

router.post('/create', isAuthenticatedUser, isAuthorized('admin'), createVendor);
router.get('/', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllVendors);
router.get('/:id', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getVendorById);
router.put('/:id', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), updateVendor);
router.delete('/:id', isAuthenticatedUser, isAuthorized('admin'), deleteVendor);

module.exports = router;
