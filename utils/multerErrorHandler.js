const multer = require("multer");

// utils/multerErrorHandler.js
module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer Error:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size is too large. Maximum size is 2MB.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    console.error("General Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
  next();
};
