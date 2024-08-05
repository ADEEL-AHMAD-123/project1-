const express = require('express');
const router = express.Router();
const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource
} = require('../controllers/billingController');
const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');

// Route to create a new resource
router.post('/create', isAuthenticatedUser, isAuthorized('admin'), createResource);


// Route to get a resource by ID
router.get('/resources/:id', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getResourceById);

// Route to get all resources
router.get('/resources', isAuthenticatedUser, isAuthorized('admin', 'supportive staff'), getAllResources);



// Route to update a resource by ID
router.put('/resources/:id', isAuthenticatedUser, isAuthorized('admin'), updateResource);

// Route to delete a resource by ID
router.delete('/resources/:id', isAuthenticatedUser, isAuthorized('admin'), deleteResource);

module.exports = router;
