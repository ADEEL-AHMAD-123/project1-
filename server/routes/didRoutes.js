const express = require('express');
const router = express.Router();
const { 
  addDID, 
  getAvailableDIDs, 
  addDIDsInBulk, 
  getGlobalPricing, 
  addOrUpdateGlobalPricing,  
  editDIDConfig, 
  deleteDID 
} = require('../controllers/didController');

const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');
 
// Add DID (admin only)
router.post('/', isAuthenticatedUser, isAuthorized('admin'), addDID);
router.post('/bulk', isAuthenticatedUser, isAuthorized('admin'), addDIDsInBulk);

// Get available DIDs
router.get('/available', isAuthenticatedUser, getAvailableDIDs);

// Get global pricing
router.get('/pricing', getGlobalPricing);

// // Add or update global pricing (admin only)
router.post('/pricing', isAuthenticatedUser, isAuthorized('admin'), addOrUpdateGlobalPricing); 

// Edit technical configuration of DID
router.put('/:id/config', isAuthenticatedUser, editDIDConfig);

// // Delete DID
router.delete('/:id', isAuthenticatedUser, deleteDID);

module.exports = router;
