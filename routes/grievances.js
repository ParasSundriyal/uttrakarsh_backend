const express = require('express');
const router = express.Router();
const {
  createGrievance,
  getGrievances,
  getGrievance,
  updateGrievance,
  addComment,
  getAttachment,
} = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');




// Protect all routes
router.use(protect);

// Routes
router
  .route('/create')
  .get(getGrievances)
  .post(upload.single('photo'), createGrievance);

router
  .route('/:id')
  .get(getGrievance)
  .put(upload.single('photo'), updateGrievance);

router.post('/:id/comments', addComment);

// This route might not be needed if Cloudinary is used, but kept for legacy support
router.get('/attachments/:filename', getAttachment);

module.exports = router;
