const express = require('express');
const {
  getAllLogs,
  // getLogById,
  // updateLog,
  // deleteLog,
} = require('../controllers/logController');
const { isAuthenticatedUser, isAuthorized } = require('../middlewares/auth');

const router = express.Router();

// Define the routes
router.get('/', isAuthenticatedUser, isAuthorized('admin'), getAllLogs);
// router.get('/:id', isAuthenticatedUser, isAuthorized('admin'), getLogById);
// router.put('/:id', isAuthenticatedUser, isAuthorized('admin'), updateLog);
// router.delete('/:id', isAuthenticatedUser, isAuthorized('admin'), deleteLog);

module.exports = router;
