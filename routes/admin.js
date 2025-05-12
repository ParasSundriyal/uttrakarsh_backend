const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const {
  getAllGrievances,
  getGrievanceStats,
  updateGrievance,
  getAllUsers
} = require('../controllers/admin');

// All routes are protected and require admin role
router.use(protect);
router.use(adminAuth);

// Get all grievances with filtering
router.get('/grievances', getAllGrievances);

// Get grievance statistics
router.get('/stats', getGrievanceStats);

// Update grievance
router.put('/grievances/:id', updateGrievance);

// Get all users
router.get('/users', getAllUsers);

module.exports = router; 