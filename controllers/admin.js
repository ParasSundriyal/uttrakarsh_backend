const Grievance = require('../models/Grievance');
const User = require('../models/User');

// Get all grievances with filtering and pagination
exports.getAllGrievances = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const grievances = await Grievance.find(filter)
      .populate('submittedBy', 'name email studentId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Grievance.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: grievances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grievances'
    });
  }
};

// Get grievance statistics
exports.getGrievanceStats = async (req, res) => {
  try {
    const stats = await Grievance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Grievance.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        categoryStats: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// Update grievance status and assign
exports.updateGrievance = async (req, res) => {
  try {
    const { status, assignedTo, comment } = req.body;
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    // If status is Rejected, delete the grievance
    if (status === "Rejected") {
      await Grievance.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Grievance rejected and deleted."
      });
    }

    // Update grievance
    if (status) grievance.status = status;
    if (assignedTo) grievance.assignedTo = assignedTo;

    // Add comment if provided
    if (comment) {
      grievance.comments.push({
        text: comment,
        user: req.user.id
      });
    }

    await grievance.save();

    res.status(200).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating grievance'
    });
  }
};

// Get all users (students and faculty)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'faculty'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
}; 