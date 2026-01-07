const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { cvStorage, imageStorage } = require('../config/cloudinary');
const { validateProfile } = require('../middleware/validation');
const profileController = require('../controllers/profileController');

// Multer Config for Profile Picture using Cloudinary
const profilePictureUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    const receivedExt = path.extname(file.originalname).toLowerCase();
    const receivedMime = file.mimetype;
    cb(new Error(`Invalid file format for profile picture. Received: ${receivedExt || receivedMime}. Allowed: jpeg, jpg, png, gif, webp`));
  }
});

// Multer Config for Resume using Cloudinary
const resumeUpload = multer({
  storage: cvStorage,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    const receivedExt = path.extname(file.originalname).toLowerCase();
    const receivedMime = file.mimetype;
    cb(new Error(`Invalid file format for resume. Received: ${receivedExt || receivedMime}. Allowed: pdf, doc, docx`));
  }
});

// Combined upload middleware for both files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      const receivedExt = path.extname(file.originalname).toLowerCase();
      const receivedMime = file.mimetype;
      cb(new Error(`Invalid file format for profile picture. Received: ${receivedExt || receivedMime}. Allowed: jpeg, jpg, png, gif, webp`));
    } else if (file.fieldname === 'resume') {
      const allowedTypes = /pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      const receivedExt = path.extname(file.originalname).toLowerCase();
      const receivedMime = file.mimetype;
      cb(new Error(`Invalid file format for resume. Received: ${receivedExt || receivedMime}. Allowed: pdf, doc, docx`));
    } else {
      cb(null, true);
    }
  }
});

// Custom middleware wrapper for strict error handling
const handleUpload = (req, res, next) => {
  const uploadMiddleware = upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]);

  uploadMiddleware(req, res, (err) => {
    if (err) {
      // Handle Multer-specific errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size allowed is 4MB.' });
        }
        return res.status(400).json({ message: err.message });
      }
      // Handle custom fileFilter errors
      if (err) {
        return res.status(400).json({ message: err.message });
      }
    }
    next();
  });
};

// Check if profile exists (authenticated users only)
router.get('/check', authenticate, profileController.checkProfile);

// Get profile (authenticated users only - returns their own profile)
router.get('/', authenticate, profileController.getProfile);

// Create or Update Profile (authenticated users only)
router.post('/', authenticate, handleUpload, validateProfile, profileController.createOrUpdateProfile);

module.exports = router;

