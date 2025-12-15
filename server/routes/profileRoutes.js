const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const UserProfile = require('../models/UserProfile');
const { authenticate } = require('../middleware/auth');
const { cloudinary, cvStorage, imageStorage, uploadFile, getPreviewUrl, getDownloadUrl, normalizeFileData } = require('../config/cloudinary');

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
router.get('/check', authenticate, async (req, res) => {
  try {
    // SECURITY: Use candidateId from authenticated session, NOT email from frontend
    const candidateId = req.candidate.id;
    const profile = await UserProfile.findOne({ candidateId: candidateId });
    
    res.json({ exists: !!profile });
  } catch (err) {
    console.error('Error checking profile:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// Get profile (authenticated users only - returns their own profile)
router.get('/', authenticate, async (req, res) => {
  try {
    // SECURITY: Use candidateId from authenticated session, NOT email from frontend
    const candidateId = req.candidate.id;
    
    console.log('Fetching profile for candidateId:', candidateId);
    
    // Find profile by candidateId (strict data isolation)
    const profile = await UserProfile.findOne({ candidateId: candidateId });
    
    if (!profile) {
      console.log('Profile not found for candidateId:', candidateId);
      return res.status(404).json({ msg: 'Profile not found' });
    }
    
    console.log('Profile found:', {
      id: profile._id,
      fullName: profile.fullName,
      email: profile.email,
      hasProfilePicture: !!profile.profilePicture,
      hasResumePath: !!profile.resumePath
    });
    
    // Normalize file URLs (handle both old string format and new object format)
    const profileData = profile.toObject();
    if (profileData.profilePicture) {
      const normalized = normalizeFileData(profileData.profilePicture);
      profileData.profilePicture = normalized || profileData.profilePicture;
    }
    if (profileData.resumePath) {
      const normalized = normalizeFileData(profileData.resumePath);
      profileData.resumePath = normalized || profileData.resumePath;
    }
    
    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// Create or Update Profile (authenticated users only)
router.post('/', authenticate, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const profileData = JSON.parse(req.body.profileData || '{}');
    // SECURITY: Get candidateId and email from authenticated session, NOT from frontend
    const candidateId = req.candidate.id;
    const email = req.candidate.email;
    
    // Clean CNIC - remove dashes and spaces, ensure 13 digits
    if (profileData.cnic) {
      profileData.cnic = profileData.cnic.replace(/[-\s]/g, '');
    }
    
    // Handle file uploads to Cloudinary
    if (req.files) {
      // Upload profile picture to Cloudinary
      if (req.files.profilePicture) {
        try {
          const fileInfo = await uploadFile(
            req.files.profilePicture[0].buffer,
            'first-steps-school/profile-pictures',
            req.files.profilePicture[0].originalname
          );
          // Store only the secure_url string (schema expects String type)
          profileData.profilePicture = fileInfo.secure_url;
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          return res.status(500).json({ msg: 'Error uploading profile picture', error: uploadError.message });
        }
      }
      
      // Upload resume to Cloudinary
      if (req.files.resume) {
        try {
          const fileInfo = await uploadFile(
            req.files.resume[0].buffer,
            'first-steps-school/cvs',
            req.files.resume[0].originalname
          );
          // Store only the secure_url string (schema expects String type)
          profileData.resumePath = fileInfo.secure_url;
        } catch (uploadError) {
          console.error('Error uploading resume:', uploadError);
          return res.status(500).json({ msg: 'Error uploading resume', error: uploadError.message });
        }
      }
    }

    // Handle education - filter out empty entries
    if (profileData.education && Array.isArray(profileData.education)) {
      profileData.education = profileData.education.filter(edu => 
        edu && edu.degree && edu.degree.trim() && 
        edu.institution && edu.institution.trim()
      );
    } else {
      profileData.education = [];
    }
    
    // Handle work experience - filter out empty entries
    if (profileData.workExperience && Array.isArray(profileData.workExperience)) {
      profileData.workExperience = profileData.workExperience.filter(exp => 
        exp && 
        exp.companyName && exp.companyName.trim() && 
        exp.jobTitle && exp.jobTitle.trim()
      );
    } else {
      profileData.workExperience = [];
    }
    
    // Handle skills - filter out empty entries
    if (profileData.skills && Array.isArray(profileData.skills)) {
      profileData.skills = profileData.skills.filter(s => s && s.trim());
    } else {
      profileData.skills = [];
    }
    
    // Handle certifications - filter out empty entries
    if (profileData.certifications && Array.isArray(profileData.certifications)) {
      profileData.certifications = profileData.certifications.filter(cert => 
        cert && cert.name && cert.name.trim()
      );
    } else {
      profileData.certifications = [];
    }

    console.log('Profile data after filtering:', {
      education: profileData.education?.length || 0,
      workExperience: profileData.workExperience?.length || 0,
      skills: profileData.skills?.length || 0,
      certifications: profileData.certifications?.length || 0
    });

    // SECURITY: Use authenticated email for display only, candidateId for queries
    // Email is ALWAYS taken from authenticated session, never from request body
    profileData.email = email.toLowerCase().trim();
    profileData.candidateId = candidateId; // PRIMARY IDENTIFIER

    // Check for existing profile by email (for migration from old profiles without candidateId)
    const profileByEmail = await UserProfile.findOne({ 
      email: email.toLowerCase().trim()
    });

    // If profile exists with this email, check if it belongs to this candidate
    if (profileByEmail) {
      // If profile has a different candidateId, it's a security violation
      if (profileByEmail.candidateId && profileByEmail.candidateId.toString() !== candidateId.toString()) {
        return res.status(403).json({ 
          msg: 'This email is already registered with a different account. Please contact support.' 
        });
      }
      // If profile exists but has no candidateId, we'll update it with the current candidateId
      // This handles migration from old profiles created before candidateId was added
    }

    // Security: Check if CNIC is already used by another candidate
    const cnicCheck = await UserProfile.findOne({ 
      cnic: profileData.cnic,
      candidateId: { $exists: true, $ne: candidateId } // Exclude current user's profile and profiles without candidateId
    });
    if (cnicCheck) {
      return res.status(403).json({ 
        msg: 'This CNIC is already registered with another account. Each user must have a unique CNIC.' 
      });
    }

    // Prepare update data
    const updateData = {
      ...profileData,
      updatedAt: new Date()
    };

    // Use findOneAndUpdate with upsert to atomically create or update profile
    // First try to find by candidateId (primary identifier)
    // If not found, the upsert will create a new one
    // But we also need to handle the case where profile exists by email but not candidateId
    let profile = await UserProfile.findOne({ candidateId: candidateId });

    if (!profile && profileByEmail) {
      // Profile exists by email but not by candidateId - update it
      profileByEmail.set(updateData);
      profileByEmail.candidateId = candidateId; // Set the candidateId
      profileByEmail.updatedAt = new Date();
      profile = await profileByEmail.save();
    } else if (!profile) {
      // No profile found - create new one using upsert
      profile = await UserProfile.findOneAndUpdate(
        { candidateId: candidateId },
        {
          $set: updateData,
          $setOnInsert: { createdAt: new Date() } // Only set on insert (new profile)
        },
        {
          upsert: true, // Create if doesn't exist, update if exists
          new: true, // Return the updated document
          runValidators: true // Run schema validators
        }
      );
    } else {
      // Profile exists by candidateId - update it
      profile.set(updateData);
      profile.candidateId = candidateId; // Ensure candidateId is set
      profile.updatedAt = new Date();
      profile = await profile.save();
    }

    // Link profile to candidate (always update to ensure link is correct)
    const Candidate = require('../models/Candidate');
    const candidate = await Candidate.findById(candidateId);
    if (candidate) {
      candidate.profileId = profile._id;
      await candidate.save();
    }

    // Check if this was a new profile creation (for admin notification)
    // We can't easily determine if it was created or updated with upsert,
    // so we'll check if createdAt is very recent (within last 5 seconds)
    const isNewProfile = profile.createdAt && 
      (new Date() - new Date(profile.createdAt)) < 5000;

    // Notify admin about new profile creation
    if (isNewProfile) {
      const { sendEmail } = require('../config/email');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@firststepsschool.com';
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Candidate Profile Created</h2>
          <p>A new candidate has completed their profile:</p>
          <ul>
            <li><strong>Name:</strong> ${profileData.fullName}</li>
            <li><strong>Email:</strong> ${profileData.email}</li>
            <li><strong>CNIC:</strong> ${profileData.cnic}</li>
            <li><strong>Phone:</strong> ${profileData.phone}</li>
            <li><strong>Date/Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/candidates">View in admin dashboard</a></p>
        </div>
      `;

      await sendEmail(
        adminEmail,
        'New Candidate Profile Created - First Steps School',
        adminHtml
      );
    }

    // Return appropriate message based on whether it was created or updated
    const message = isNewProfile ? 'Profile created successfully' : 'Profile updated successfully';
    res.json({ msg: message, profile });
  } catch (err) {
    console.error('Error saving profile:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email or CNIC already exists' });
    }
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;

