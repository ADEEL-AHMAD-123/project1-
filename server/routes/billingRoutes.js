const express = require('express');
const router = express.Router();
const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  getAllDays,
  getAllMonths
} = require('../controllers/billingController');
const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');

// Route to create a new resource
router.post('/create', isAuthenticatedUser, isAuthorized('admin','client','supportive staff'), createResource);


// Route to get a resource by ID
router.get('/resources/:id', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getResourceById);

// Route to get all resources
router.get('/resources', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllResources);

// Route to get all resources
router.get('/resources', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllResources);



// Route to update a resource by ID
router.put('/resources/:id', isAuthenticatedUser, isAuthorized('admin'), updateResource);

// Route to delete a resource by ID
router.delete('/resources/:id', isAuthenticatedUser, isAuthorized('admin'), deleteResource);


// Route to get record of a user for a day
router.get('/summary/days', isAuthenticatedUser, isAuthorized('admin', 'supportive staff','client'), getAllDays);

// Route to get record of a user for a day
router.get('/summary/month', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllMonths);


module.exports = router;
