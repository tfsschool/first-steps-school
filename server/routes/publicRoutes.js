const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cvStorage } = require('../config/cloudinary');

// Multer Config for CV Uploads using Cloudinary
const upload = multer({ 
    storage: cvStorage,
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
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'Open' });
        res.json(jobs);
    } catch (err) { res.status(500).send('Server Error'); }
});

// 1b. Check if user already applied for a job (authenticated users only)
router.get('/check-application/:jobId', authenticate, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
            return res.status(400).json({ msg: 'Invalid job ID' });
        }

        const jobId = new mongoose.Types.ObjectId(req.params.jobId);
        // SECURITY: Use candidateId from authenticated session, NOT email from frontend
        const candidateId = req.candidate.id;
        
        const existingApp = await Application.findOne({
            jobId: jobId,
            candidateId: candidateId // STRICT DATA ISOLATION
        });

        res.json({ applied: !!existingApp });
    } catch (err) {
        console.error('Check application error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 2. Submit Application (authenticated users only)
router.post('/apply/:jobId', authenticate, upload.single('cv'), async (req, res) => {
    try {
        // Convert jobId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
            return res.status(400).json({ msg: 'Invalid job ID' });
        }

        const jobId = new mongoose.Types.ObjectId(req.params.jobId);
        const job = await Job.findById(jobId);
        
        if(!job) {
            return res.status(404).json({ msg: 'Job position not found.' });
        }
        
        if(job.status === 'Closed') {
            return res.status(400).json({ msg: 'This position is no longer accepting applications.' });
        }

        // SECURITY: Get candidateId and email from authenticated session, NOT from frontend
        const candidateId = req.candidate.id;
        const email = req.candidate.email;

        // Handle profile-based application (cvPath provided) or file upload
        let cvPath;
        if (req.body.cvPath) {
            // Using profile resume (already a Cloudinary URL)
            cvPath = req.body.cvPath;
        } else if (req.file) {
            // Using uploaded file - req.file.path is the Cloudinary secure URL
            cvPath = req.file.path;
        } else {
            return res.status(400).json({ msg: 'CV file is required' });
        }

        // Parse education if it's a JSON string
        let educationText = '';
        if (req.body.education) {
            try {
                const educationData = typeof req.body.education === 'string' 
                    ? JSON.parse(req.body.education) 
                    : req.body.education;
                // Convert education array to readable text
                educationText = Array.isArray(educationData)
                    ? educationData.map(edu => `${edu.degree} - ${edu.institution} (${edu.yearOfCompletion})`).join('; ')
                    : req.body.education;
            } catch (e) {
                educationText = req.body.education;
            }
        }

        // Validate required fields
        if (!req.body.fullName || !req.body.phone) {
            return res.status(400).json({ msg: 'All required fields must be provided' });
        }

        // STRICT DATA ISOLATION: Check if already applied for this job by candidateId
        const existingApplication = await Application.findOne({
            jobId: jobId,
            candidateId: candidateId // Use candidateId, not email
        });

        if (existingApplication) {
            return res.status(400).json({ 
                msg: 'You have already applied for this job position.' 
            });
        }

        // Try to find user profile by candidateId (strict data isolation)
        const UserProfile = require('../models/UserProfile');
        let profileId = null;
        try {
            const profile = await UserProfile.findOne({ candidateId: candidateId });
            if (profile) {
                profileId = profile._id;
            }
        } catch (profileErr) {
            console.log('Profile not found for candidateId:', candidateId);
        }

        const newApp = new Application({
            candidateId: candidateId, // PRIMARY IDENTIFIER - STRICT DATA ISOLATION
            jobId: jobId, // Use ObjectId
            profileId: profileId,
            fullName: req.body.fullName.trim(),
            email: email.toLowerCase().trim(), // Use authenticated email for display/admin
            phone: req.body.phone.trim(),
            education: educationText || 'Not provided',
            cvPath: cvPath
        });

        const savedApp = await newApp.save();

        // Send confirmation email to candidate
        const { sendEmail } = require('../config/email');
        const candidateEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Application Submitted Successfully!</h2>
                <p>Dear ${req.body.fullName},</p>
                <p>Your application for <strong>${job.title}</strong> has been received.</p>
                <p>Our team will review your application and contact you soon.</p>
                <p>Thank you for your interest in First Steps School!</p>
            </div>
        `;

        await sendEmail(
            email,
            'Application Submitted - First Steps School',
            candidateEmailHtml
        );

        // Notify admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@firststepsschool.com';
        const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">New Job Application Received</h2>
                <p>A new job application has been submitted:</p>
                <ul>
                    <li><strong>Candidate Name:</strong> ${req.body.fullName}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${req.body.phone}</li>
                    <li><strong>Job Title:</strong> ${job.title}</li>
                    <li><strong>Date & Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/candidates">View candidate profile in admin dashboard</a></p>
            </div>
        `;

        await sendEmail(
            adminEmail,
            'New Job Application Received - First Steps School',
            adminEmailHtml
        );

        res.json({ msg: 'Application submitted successfully!' });
    } catch (err) {
        console.error('Application submission error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'You have already applied for this position.' });
        }
        res.status(500).json({ msg: 'Server error. Please try again later.', error: err.message });
    }
});

module.exports = router;