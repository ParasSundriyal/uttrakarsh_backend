// backend/middleware/upload.js
const multer = require('multer');
const { storage } = require('../config/cloudinary.js');

const upload = multer({ storage });

module.exports = upload;
