const express = require('express');
const router = express.Router();
const { addDID,getAvailableDIDs,addDIDsInBulk, getGlobalPricing, editDIDConfig, deleteDID } = require('../controllers/DIDController');

const { isAuthenticatedUser ,isAuthorized} = require('../middlewares/auth');
// Add DID (admin only)
router.post('/', isAuthenticatedUser, isAuthorized('admin'), addDID);
router.post('/bulk', isAuthenticatedUser, isAuthorized('admin'), addDIDsInBulk);

router.get('/available', isAuthenticatedUser, getAvailableDIDs);
router.get('/pricing', getGlobalPricing);
router.put('/:id/config', isAuthenticatedUser, editDIDConfig);
router.delete('/:id', isAuthenticatedUser, deleteDID); 

module.exports = router;
