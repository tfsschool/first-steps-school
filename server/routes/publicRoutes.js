const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { validateApplication } = require('../middleware/validation');
const publicController = require('../controllers/publicController');

// Multer Config for CV Uploads (using memory storage, then upload to Cloudinary)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and Word documents are allowed'));
    }
});

// 1. Get Open Jobs
router.get('/jobs', publicController.getOpenJobs);

// 1b. Check if user already applied for a job (authenticated users only)
router.get('/check-application/:jobId', authenticate, publicController.checkApplication);

// 2. Submit Application (authenticated users only)
router.post('/apply/:jobId', authenticate, upload.single('cv'), validateApplication, publicController.submitApplication);

module.exports = router;