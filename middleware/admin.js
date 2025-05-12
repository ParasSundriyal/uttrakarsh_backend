const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // Check if user exists and is admin
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = adminAuth; 