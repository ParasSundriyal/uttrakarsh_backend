const express = require("express");
const router = express.Router();
const {
  createGrievance,
  getGrievances,
  getGrievance,
  updateGrievance,
  addComment,
  // getAttachment, // ❌ REMOVE this line
} = require("../controllers/grievanceController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const multerErrorHandler = require("../utils/multerErrorHandler");

// Protect all routes
router.use(protect);

// Routes
router
  .route("/")
  .post(upload.single("photo"), multerErrorHandler, createGrievance)
  .get(getGrievances);

router
  .route("/:id")
  .get(getGrievance)
  .put(upload.single("photo"), updateGrievance);

router.post("/:id/comments", addComment);

// router.get('/attachments/:filename', getAttachment); ❌ REMOVE this route

module.exports = router;
