const Department = require('../models/Department');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'department' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Login department
// @route   POST /api/department/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { departmentId, password } = req.body;
    const department = await Department.findOne({ departmentId }).select('+password');
    if (!department) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await department.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(department._id);
    res.status(200).json({
      success: true,
      token,
      department: {
        id: department._id,
        name: department.name,
        departmentId: department.departmentId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 