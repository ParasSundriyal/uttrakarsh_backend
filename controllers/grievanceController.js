const Grievance = require('../models/Grievance');
const { gfs } = require('../services/gridfs');

// @desc    Create new grievance
// @route   POST /api/grievances
// @access  Private
exports.createGrievance = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const attachments = req.file
      ? [{ filename: req.file.filename, path: req.file.id ? req.file.id.toString() : undefined }]
      : [];

    const grievance = await Grievance.create({
      title,
      description,
      category,
      priority,
      submittedBy: req.user.id,
      attachments,
    });

    res.status(201).json({
      success: true,
      data: grievance,
    });
  } catch (err) {
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
    let query;

    // If user is not admin, only show their grievances
    if (req.user.role !== 'admin') {
      query = Grievance.find({ submittedBy: req.user.id });
    } else {
      query = Grievance.find();
    }

    // Add filters
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }
    if (req.query.priority) {
      query = query.find({ priority: req.query.priority });
    }

    // Add sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const grievances = await query
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single grievance
// @route   GET /api/grievances/:id
// @access  Private
exports.getGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email role');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Check if user is authorized to view the grievance
    if (req.user.role !== 'admin' && grievance.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this grievance',
      });
    }

    res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update grievance
// @route   PUT /api/grievances/:id
// @access  Private
exports.updateGrievance = async (req, res) => {
  try {
    let grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Check if user is authorized to update the grievance
    if (req.user.role !== 'admin' && grievance.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this grievance',
      });
    }

    // Only allow status updates for admins
    if (req.user.role === 'admin' && req.body.status) {
      grievance.status = req.body.status;
    }

    // Allow users to update their own grievances
    if (req.user.role !== 'admin') {
      const { title, description, category, priority } = req.body;
      grievance.title = title || grievance.title;
      grievance.description = description || grievance.description;
      grievance.category = category || grievance.category;
      grievance.priority = priority || grievance.priority;
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      grievance.attachments = [
        ...grievance.attachments,
        ...req.files.map(file => ({
          filename: file.filename,
          path: file.path,
        })),
      ];
    }

    await grievance.save();

    res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Add comment to grievance
// @route   POST /api/grievances/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found',
      });
    }

    // Check if user is authorized to comment
    if (req.user.role !== 'admin' && grievance.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this grievance',
      });
    }

    grievance.comments.push({
      text: req.body.text,
      user: req.user.id,
    });

    await grievance.save();

    res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAttachment = (req, res) => {
  if (!gfs) {
    return res.status(500).json({ success: false, message: 'File system not initialized' });
  }
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ success: false, message: 'No file exists' });
    }
    // Check if image
    if (file.contentType && file.contentType.startsWith('image/')) {
      res.set('Content-Type', file.contentType);
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      // For non-images, force download
      res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    }
  });
}; 