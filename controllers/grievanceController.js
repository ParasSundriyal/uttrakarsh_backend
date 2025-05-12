const Grievance = require("../models/Grievance");
const Department = require('../models/Department');

// @desc    Create new grievance
// @route   POST /api/grievances
// @access  Private
const categoryToDepartment = {
  Academic: 'ACAD001',
  Administration: 'ADMIN001',
  Infrastructure: 'INFRA001',
  Hostel: 'HOSTEL001',
  General: 'GEN001',
};

exports.createGrievance = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const attachments = req.file
      ? [{ url: req.file.path, public_id: req.file.filename }]
      : [];

    // Find department by category
    const departmentId = categoryToDepartment[category];
    let department = null;
    if (departmentId) {
      department = await Department.findOne({ departmentId });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      priority,
      submittedBy: req.user.id,
      attachments,
      department: department ? department._id : undefined,
    });

    res.status(201).json({
      success: true,
      data: grievance,
    });
  } catch (err) {
    console.error("Grievance creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// @desc    Get all grievances
// @route   GET /api/grievances
// @access  Private
exports.getGrievances = async (req, res) => {
  try {
    let query =
      req.user.role !== "admin"
        ? Grievance.find({ submittedBy: req.user.id })
        : Grievance.find();

    if (req.query.status) query = query.find({ status: req.query.status });
    if (req.query.category)
      query = query.find({ category: req.query.category });
    if (req.query.priority)
      query = query.find({ priority: req.query.priority });
    query = req.query.sort
      ? query.sort(req.query.sort.split(",").join(" "))
      : query.sort("-createdAt");

    const grievances = await query
      .populate("submittedBy", "name email studentId department")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single grievance
// @route   GET /api/grievances/:id
// @access  Private
exports.getGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("submittedBy", "name email studentId department")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email role");

    if (!grievance)
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this grievance",
        });
    }

    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update grievance
// @route   PUT /api/grievances/:id
// @access  Private
exports.updateGrievance = async (req, res) => {
  try {
    let grievance = await Grievance.findById(req.params.id);
    if (!grievance)
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this grievance",
        });
    }

    // If admin is rejecting, delete the grievance
    if (req.user.role === "admin" && req.body.status === "Rejected") {
      await Grievance.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: "Grievance rejected and deleted." });
    }

    if (req.user.role === "admin" && req.body.status)
      grievance.status = req.body.status;

    if (req.user.role !== "admin") {
      const { title, description, category, priority } = req.body;
      grievance.title = title || grievance.title;
      grievance.description = description || grievance.description;
      grievance.category = category || grievance.category;
      grievance.priority = priority || grievance.priority;
    }

    if (req.file) {
      grievance.attachments.push({
        url: req.file.path,
        public_id: req.file.filename,
      });
    }

    await grievance.save();

    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add comment to grievance
// @route   POST /api/grievances/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance)
      return res
        .status(404)
        .json({ success: false, message: "Grievance not found" });

    if (
      req.user.role !== "admin" &&
      grievance.submittedBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to comment" });
    }

    grievance.comments.push({ text: req.body.text, user: req.user.id });
    await grievance.save();

    res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
