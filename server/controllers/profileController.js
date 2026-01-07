const UserProfile = require('../models/UserProfile');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const { uploadFile, normalizeFileData } = require('../config/cloudinary');

/**
 * Check if profile exists for authenticated user
 */
const checkProfile = async (req, res) => {
  try {
    const candidateId = req.candidate.id;
    const profile = await UserProfile.findOne({ candidateId: candidateId });
    
    res.json({ exists: !!profile });
  } catch (err) {
    console.error('Error checking profile:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * Get profile for authenticated user
 */
const getProfile = async (req, res) => {
  try {
    const candidateId = req.candidate.id;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching profile for candidateId:', candidateId);
    }

    // CHECK IF LOCKED: Has the user applied to any job?
    const hasApplied = await Application.exists({ candidateId: candidateId });
    const isLocked = !!hasApplied;
    
    const profile = await UserProfile.findOne({ candidateId: candidateId });
    
    if (!profile) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile not found for candidateId:', candidateId);
      }
      // Return isLocked even if profile doesn't exist
      return res.status(404).json({ msg: 'Profile not found', isLocked });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile found:', {
        id: profile._id,
        fullName: profile.fullName,
        email: profile.email,
        hasProfilePicture: !!profile.profilePicture,
        hasResumePath: !!profile.resumePath,
        isLocked
      });
    }
    
    const profileData = profile.toObject();
    if (profileData.profilePicture) {
      const normalized = normalizeFileData(profileData.profilePicture);
      profileData.profilePicture = normalized || profileData.profilePicture;
    }
    if (profileData.resumePath) {
      const normalized = normalizeFileData(profileData.resumePath);
      profileData.resumePath = normalized || profileData.resumePath;
    }
    
    // SEND isLocked STATUS
    res.json({ ...profileData, isLocked });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};

/**
 * Create or update profile for authenticated user
 */
const createOrUpdateProfile = async (req, res) => {
  try {
    const candidateId = req.candidate.id;

    // SECURITY CHECK: Block update if profile is locked
    const hasApplied = await Application.exists({ candidateId: candidateId });
    if (hasApplied) {
      return res.status(403).json({ 
        msg: 'Profile is locked. You cannot update your profile after submitting an application.' 
      });
    }

    const profileData = JSON.parse(req.body.profileData || '{}');
    Object.keys(profileData || {}).forEach((key) => {
      if (profileData[key] === '') {
        delete profileData[key];
      }
    });
    
    const email = req.candidate.email;
    
    // Validate profile fields and return detailed errors
    const { validateProfileFields } = require('../middleware/validation');
    const validationErrors = validateProfileFields(profileData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        msg: 'Validation failed',
        errors: validationErrors.map(e => `${e.field}: ${e.message}`)
      });
    }
    
    // CNIC formatting
    let cleanedCnic = '';
    if (profileData.cnic) {
      cleanedCnic = String(profileData.cnic).replace(/[-\s]/g, '');
      if (cleanedCnic.length === 13) {
        profileData.cnic = `${cleanedCnic.slice(0, 5)}-${cleanedCnic.slice(5, 12)}-${cleanedCnic.slice(12)}`;
      } else {
        profileData.cnic = cleanedCnic;
      }
    }
    
    // Handle file uploads to Cloudinary
    if (req.files) {
      if (req.files.profilePicture) {
        try {
          const fileInfo = await uploadFile(
            req.files.profilePicture[0].buffer,
            'first-steps-school/profile-pictures',
            req.files.profilePicture[0].originalname
          );
          profileData.profilePicture = fileInfo.secure_url;
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          return res.status(500).json({ msg: 'Error uploading profile picture', error: uploadError.message });
        }
      }
      
      if (req.files.resume) {
        try {
          const fileInfo = await uploadFile(
            req.files.resume[0].buffer,
            'first-steps-school/cvs',
            req.files.resume[0].originalname
          );
          profileData.resumePath = fileInfo.secure_url;
        } catch (uploadError) {
          console.error('Error uploading resume:', uploadError);
          return res.status(500).json({ msg: 'Error uploading resume', error: uploadError.message });
        }
      }
    }

    // Filter empty array entries
    if (profileData.education && Array.isArray(profileData.education)) {
      profileData.education = profileData.education.filter(edu => 
        edu && edu.degree && edu.degree.trim() && 
        edu.institution && edu.institution.trim()
      );
    } else {
      profileData.education = [];
    }
    
    if (profileData.workExperience && Array.isArray(profileData.workExperience)) {
      profileData.workExperience = profileData.workExperience.filter(exp => 
        exp && exp.companyName && exp.companyName.trim()
      );
    } else {
      profileData.workExperience = [];
    }
    
    if (profileData.skills && Array.isArray(profileData.skills)) {
      profileData.skills = profileData.skills.filter(s => s && s.trim());
    } else {
      profileData.skills = [];
    }
    
    if (profileData.certifications && Array.isArray(profileData.certifications)) {
      profileData.certifications = profileData.certifications.filter(cert => 
        cert && cert.name && cert.name.trim()
      );
    } else {
      profileData.certifications = [];
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Profile data after filtering:', {
        education: profileData.education?.length || 0,
        workExperience: profileData.workExperience?.length || 0,
        skills: profileData.skills?.length || 0,
        certifications: profileData.certifications?.length || 0
      });
    }

    profileData.email = email.toLowerCase().trim();
    profileData.candidateId = candidateId;

    const profileByEmail = await UserProfile.findOne({ 
      email: email.toLowerCase().trim()
    });

    if (profileByEmail) {
      if (profileByEmail.candidateId && profileByEmail.candidateId.toString() !== candidateId.toString()) {
        return res.status(403).json({ 
          msg: 'This email is already registered with a different account. Please contact support.' 
        });
      }
    }

    // Security: Check if CNIC is already used by another candidate
    // Only check if CNIC is provided and not empty
    if (cleanedCnic && cleanedCnic.length > 0) {
      const cnicVariants = [];
      cnicVariants.push(cleanedCnic);
      if (cleanedCnic.length === 13) {
        cnicVariants.push(`${cleanedCnic.slice(0, 5)}-${cleanedCnic.slice(5, 12)}-${cleanedCnic.slice(12)}`);
      }

      const cnicCheck = await UserProfile.findOne({
        cnic: { $in: cnicVariants },
        candidateId: { $exists: true, $ne: candidateId }
      });
      
      if (cnicCheck) {
        return res.status(403).json({ 
          msg: 'This CNIC is already registered with another account. Each user must have a unique CNIC.' 
        });
      }
    }

    const updateData = {
      ...profileData,
      updatedAt: new Date()
    };

    let profile = await UserProfile.findOne({ candidateId: candidateId });

    if (!profile && profileByEmail) {
      profileByEmail.set(updateData);
      profileByEmail.candidateId = candidateId;
      profileByEmail.updatedAt = new Date();
      profile = await profileByEmail.save();
    } else if (!profile) {
      profile = await UserProfile.findOneAndUpdate(
        { candidateId: candidateId },
        {
          $set: updateData,
          $setOnInsert: { createdAt: new Date() }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );
    } else {
      profile.set(updateData);
      profile.candidateId = candidateId;
      profile.updatedAt = new Date();
      profile = await profile.save();
    }

    const candidate = await Candidate.findById(candidateId);
    if (candidate) {
      candidate.profileId = profile._id;
      await candidate.save();
    }

    const isNewProfile = profile.createdAt && 
      (new Date() - new Date(profile.createdAt)) < 5000;

    const message = isNewProfile ? 'Profile created successfully' : 'Profile updated successfully';
    res.json({ msg: message, profile });
  } catch (err) {
    console.error('Error saving profile:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(400).json({ 
        msg: `This ${field || 'field'} is already registered with another account.` 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: 'Validation failed',
        errors: errors 
      });
    }
    
    // Handle other errors with detailed message
    res.status(500).json({ 
      msg: err.message || 'Server Error while saving profile',
      error: err.message 
    });
  }
};

module.exports = {
  checkProfile,
  getProfile,
  createOrUpdateProfile
};
