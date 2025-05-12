const Grievance = require('../models/Grievance');

// @desc    Get grievances for the logged-in department
// @route   GET /api/department/grievances
// @access  Private (department)
exports.getDepartmentGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ department: req.user.id })
      .populate('submittedBy', 'name email studentId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: grievances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching grievances' });
  }
}; 