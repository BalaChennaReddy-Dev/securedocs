const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Configure Multer to save to our hidden 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    // Make the filename unique to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// SECURE ROUTE: Only logged-in Owners and Admins can upload
router.post(
  '/upload', 
  verifyToken, 
  requireRole(['Owner', 'Admin']), // Viewers cannot upload!
  upload.single('file'), 
  documentController.uploadDocument
);

module.exports = router;