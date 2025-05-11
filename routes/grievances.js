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
const multer = require('multer');
const { storage } = require('../services/gridfs');

const upload = multer({ storage });

// Protect all routes
// router.use(protect);

// Routes
router
  .route('/')
  .get(getGrievances)
  .post(upload.single('photo'), createGrievance);

router
  .route('/:id')
  .get(getGrievance)
  .put(upload.single('photo'), updateGrievance);

router.post('/:id/comments', addComment);

router.get('/attachments/:filename', getAttachment);

module.exports = router; 