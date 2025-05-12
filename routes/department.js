const express = require('express');
const router = express.Router();
const departmentAuth = require('../middleware/departmentAuth');
const { getDepartmentGrievances } = require('../controllers/departmentController');

// Get grievances for the logged-in department
router.get('/grievances', departmentAuth, getDepartmentGrievances);

module.exports = router; 