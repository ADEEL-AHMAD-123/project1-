const express = require('express');
const router = express.Router();
const { createServer, getAllServersByAdmin, getServerById, getAllServersForUser } = require('../controllers/serverController');
const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');

// Create a new server
router.post('/create', isAuthenticatedUser, createServer);

// Get all servers (admin only)
router.get('/', isAuthenticatedUser, isAuthorized('admin','supportive staff'), getAllServersByAdmin);

// Get all servers for logged-in user
router.get('/user', isAuthenticatedUser, getAllServersForUser);


// Get single server by ID
router.get('/:id', isAuthenticatedUser, getServerById);

module.exports = router;
