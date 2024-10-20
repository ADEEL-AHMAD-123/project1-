const express = require('express');
const router = express.Router();
const {
  createBillingAccount,
  createSIPAccount,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  getAllDays,
  getAllMonths,
  fetchDataFromSwitchServer,
  getBillingAccount, 
  getBillingAccountRefill,
  updateBillingAccountCredit,
  getBillingAccountCredit
} = require('../controllers/billingController');
const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');

 
// Route to create a billing account
router.post('/create-billing-account', isAuthenticatedUser, isAuthorized('admin', 'client', 'supportive staff'), createBillingAccount);

// Route to create a SIP account
router.post('/create-sip-account', isAuthenticatedUser, isAuthorized('admin', 'client', 'supportive staff'), createSIPAccount);


// Route to get a resource by ID
router.get('/resources/:id', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getResourceById);

// Route to get all resources
router.get('/resources', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllResources);

// Route to update a resource by ID
router.put('/resources/:id', isAuthenticatedUser, isAuthorized('admin'), updateResource);

// Route to delete a resource by ID
router.delete('/resources/:id', isAuthenticatedUser, isAuthorized('admin'), deleteResource);

// Route to get record of a user for a day
router.get('/summary/days', isAuthenticatedUser, isAuthorized('admin', 'supportive staff', 'client'), getAllDays);

// Route to fetch data from the switch server
router.get('/records', isAuthenticatedUser, isAuthorized('admin', 'supportive staff', 'client'), fetchDataFromSwitchServer);

// Route to get monthly summary
router.get('/summary/month', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllMonths);


// Route to get the logged-in user's billing account
router.get('/account', isAuthenticatedUser, getBillingAccount);

// Route to get the logged-in user's billing account credit
router.get('/credit', isAuthenticatedUser, getBillingAccountCredit);

// Routes for the user billingAccount credit
router.get('/refill', isAuthenticatedUser, getBillingAccountRefill);
router.post('/credit', isAuthenticatedUser, updateBillingAccountCredit);

module.exports = router;
