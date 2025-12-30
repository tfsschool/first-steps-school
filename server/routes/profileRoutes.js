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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed for profile picture'));
  }
});

// Multer Config for Resume using Cloudinary
const resumeUpload = multer({
  storage: cvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and Word documents are allowed for resume'));
  }
});

// Combined upload middleware for both files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only image files are allowed for profile picture'));
    } else if (file.fieldname === 'resume') {
      const allowedTypes = /pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only PDF and Word documents are allowed for resume'));
    } else {
      cb(null, true);
    }
  }
});

// Check if profile exists (authenticated users only)
router.get('/check', authenticate, profileController.checkProfile);

// Get profile (authenticated users only - returns their own profile)
router.get('/', authenticate, profileController.getProfile);

// Create or Update Profile (authenticated users only)
router.post('/', authenticate, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), validateProfile, profileController.createOrUpdateProfile);

module.exports = router;

