const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const UserProfile = require('../models/UserProfile');
const { uploadFile } = require('../config/cloudinary');
const { sendEmail } = require('../config/email');

/**
 * Get all open jobs
 */
const getOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' });
    // Always return an array, even if empty
    res.json(Array.isArray(jobs) ? jobs : []);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    // Return empty array on error instead of string
    res.status(500).json([]);
  }
};

/**
 * Check if user already applied for a job
 */
const checkApplication = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ msg: 'Invalid job ID' });
    }

    const jobId = new mongoose.Types.ObjectId(req.params.jobId);
    const candidateId = req.candidate.id;
    
    const existingApp = await Application.findOne({
      jobId: jobId,
      candidateId: candidateId
    });

    res.json({ applied: !!existingApp });
  } catch (err) {
    console.error('Check application error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * Submit job application
 */
const submitApplication = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ msg: 'Invalid job ID' });
    }

    const jobId = new mongoose.Types.ObjectId(req.params.jobId);
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ msg: 'Job position not found.' });
    }
    
    if (job.status === 'Closed') {
      return res.status(400).json({ msg: 'This position is no longer accepting applications.' });
    }

    const candidateId = req.candidate.id;
    const email = req.candidate.email;

    // Handle CV upload
    let cvPath;
    if (req.body.cvPath) {
      cvPath = req.body.cvPath;
      if (process.env.NODE_ENV === 'development') {
        console.log('Using profile resume CV:', cvPath);
      }
    } else if (req.file) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Uploading CV file to Cloudinary:', req.file.originalname);
        }
        const fileInfo = await uploadFile(
          req.file.buffer,
          'first-steps-school/cvs',
          req.file.originalname
        );
        cvPath = fileInfo.secure_url;
        if (process.env.NODE_ENV === 'development') {
          console.log('CV uploaded successfully:', cvPath);
        }
      } catch (uploadError) {
        console.error('Error uploading CV:', uploadError);
        return res.status(500).json({ msg: 'Error uploading CV', error: uploadError.message });
      }
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

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId: jobId,
      candidateId: candidateId
    });

    if (existingApplication) {
      return res.status(400).json({ 
        msg: 'You have already applied for this job position.' 
      });
    }

    // Find user profile
    let profileId = null;
    try {
      const profile = await UserProfile.findOne({ candidateId: candidateId });
      if (profile) {
        profileId = profile._id;
      }
    } catch (profileErr) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile not found for candidateId:', candidateId);
      }
    }

    const newApp = new Application({
      candidateId: candidateId,
      jobId: jobId,
      profileId: profileId,
      fullName: req.body.fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: req.body.phone.trim(),
      education: educationText || 'Not provided',
      cvPath: cvPath,
      minimumSalary: req.body.minimumSalary || '',
      expectedSalary: req.body.expectedSalary || ''
    });

    await newApp.save();

    // Send confirmation email
    const candidateEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Application Submitted Successfully!</h2>
        <p>Dear ${req.body.fullName},</p>
        <p>Your application for <strong>${job.title}</strong> has been received.</p>
        <p>Our team will review your application and contact you soon.</p>
        <p>Thank you for your interest in The First Steps School!</p>
      </div>
    `;

    await sendEmail(
      email,
      'Application Submitted - The First Steps School',
      candidateEmailHtml
    );

    res.json({ msg: 'Application submitted successfully!' });
  } catch (err) {
    console.error('Application submission error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'You have already applied for this position.' });
    }
    res.status(500).json({ msg: 'Server error. Please try again later.', error: err.message });
  }
};

module.exports = {
  getOpenJobs,
  checkApplication,
  submitApplication
};
