const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: 'Validation failed', 
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for job application submission
 */
const validateApplication = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format')
    .isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 characters'),
  
  param('jobId')
    .notEmpty().withMessage('Job ID is required')
    .isMongoId().withMessage('Invalid job ID format'),
  
  handleValidationErrors
];

/**
 * Validation rules for profile creation/update
 */
const validateProfile = [
  body('profileData')
    .custom((value, { req }) => {
      let parsed;
      
      // Handle both string and object formats
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch (e) {
          throw new Error('Profile data must be valid JSON');
        }
      } else if (typeof value === 'object' && value !== null) {
        parsed = value;
      } else {
        throw new Error('Profile data must be a valid JSON object or string');
      }
      
      // Ensure it's an object
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Profile data must be a valid object');
      }
      
      // Only validate fullName if it's provided (allow empty for auto-save)
      if (parsed.fullName !== undefined && parsed.fullName !== null && parsed.fullName !== '') {
        if (typeof parsed.fullName !== 'string' || parsed.fullName.trim().length === 0) {
          throw new Error('Full name must be a valid string');
        }
      }
      
      // Store parsed data in req.body for use in controllers
      req.body.parsedProfileData = parsed;
      
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Validation rules for profile data fields (applied after parsing)
 */
const validateProfileFields = (profileData) => {
  const errors = [];

  // Validate full name if provided
  if (profileData.fullName) {
    const name = String(profileData.fullName).trim();
    if (name.length < 2 || name.length > 100) {
      errors.push({ field: 'fullName', message: 'Full name must be between 2 and 100 characters' });
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      errors.push({ field: 'fullName', message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' });
    }
  }

  // Validate email format if provided
  if (profileData.email) {
    const email = String(profileData.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  }

  // Validate phone if provided
  if (profileData.phone) {
    const phone = String(profileData.phone).trim();
    if (!/^[\d\s\-\+\(\)]+$/.test(phone) || phone.length < 10 || phone.length > 20) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }
  }

  // Validate CNIC if provided
  if (profileData.cnic) {
    const cnic = String(profileData.cnic).replace(/[-\s]/g, '');
    if (cnic.length !== 13 || !/^\d+$/.test(cnic)) {
      errors.push({ field: 'cnic', message: 'CNIC must be 13 digits' });
    }
  }

  // Validate date of birth if provided
  if (profileData.dateOfBirth) {
    const dob = new Date(profileData.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push({ field: 'dateOfBirth', message: 'Invalid date of birth' });
    }
    const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365);
    if (age < 16 || age > 100) {
      errors.push({ field: 'dateOfBirth', message: 'Age must be between 16 and 100 years' });
    }
  }

  // Validate gender if provided
  if (profileData.gender && !['Male', 'Female', 'Other'].includes(profileData.gender)) {
    errors.push({ field: 'gender', message: 'Gender must be Male, Female, or Other' });
  }

  return errors;
};

/**
 * Validation rules for candidate registration
 */
const validateCandidateRegistration = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for candidate login
 */
const validateCandidateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  handleValidationErrors
];

/**
 * Validation rules for admin login
 */
const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for job creation/update
 */
const validateJob = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Job title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 10 }).withMessage('Job description must be at least 10 characters'),
  
  body('status')
    .optional()
    .isIn(['Open', 'Closed']).withMessage('Status must be either Open or Closed'),
  
  handleValidationErrors
];

module.exports = {
  validateApplication,
  validateProfile,
  validateProfileFields,
  validateCandidateRegistration,
  validateCandidateLogin,
  validateAdminLogin,
  validateJob,
  handleValidationErrors
};
