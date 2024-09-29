const express = require('express');
const router = express.Router();
const { 
  addDID, 
  getAvailableDIDs, 
  addDIDsInBulk, 
  getGlobalPricing, 
  setGlobalPricing,  
  getUserPricing, 
  setUserPricing, 
  editDIDConfig, 
  deleteDID,
  getMyDIDs 
} = require('../controllers/didController');

const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');

// Add DID (admin only)
router.post('/', isAuthenticatedUser, isAuthorized('admin'), addDID);
 
// Add DIDs in bulk (admin only)
router.post('/bulk', isAuthenticatedUser, isAuthorized('admin'), addDIDsInBulk);

// Get available DIDs for purchase (requires user to be authenticated)
router.get('/available', isAuthenticatedUser, getAvailableDIDs);

// Get all DIDs of the logged-in user
router.get('/mydids', isAuthenticatedUser, getMyDIDs);

// Get global pricing (public access)
router.get('/pricing/global', getGlobalPricing);

// Set or update global pricing (admin only)
router.post('/pricing/global', isAuthenticatedUser, isAuthorized('admin'), setGlobalPricing);

// Get DID pricing for a specific user
router.get('/pricing/user/:userId', isAuthenticatedUser, getUserPricing);

// Set or update DID pricing for a specific user (admin only)
router.post('/pricing/user/:userId', isAuthenticatedUser, isAuthorized('admin'), setUserPricing);

// Edit technical configuration of DID (authenticated user)
router.put('/:id/config', isAuthenticatedUser, editDIDConfig);

// Delete DID (authenticated user)
router.delete('/:id', isAuthenticatedUser, deleteDID);

module.exports = router;
