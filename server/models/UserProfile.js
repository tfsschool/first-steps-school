const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: false },
  institution: { type: String, required: false },
  yearOfCompletion: { type: String, required: false },
  grade: { type: String, required: false }
});

const WorkExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: false },
  jobTitle: { type: String, required: false },
  startDate: { type: String, required: false },
  endDate: { type: String },
  responsibilities: { type: String, required: false },
  isCurrentJob: { type: Boolean, default: false }
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: false },
  issuingOrganization: { type: String },
  issueDate: { type: String },
  expiryDate: { type: String },
  credentialId: { type: String },
  credentialUrl: { type: String }
});

const UserProfileSchema = new mongoose.Schema({
  // Link to Candidate (PRIMARY IDENTIFIER - DO NOT TRUST EMAIL FROM FRONTEND)
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true, 
    unique: true 
  },
  
  // Personal Information
  profilePicture: { type: String },
  fullName: { type: String, required: false },
  dateOfBirth: { type: String, required: false },
  gender: { type: String, required: false, enum: ['Male', 'Female', 'Other'] },
  cnic: { 
    type: String, 
    required: false, 
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Remove any dashes or spaces and check if it's exactly 13 digits
        const cleaned = v.replace(/[-\s]/g, '');
        return /^\d{13}$/.test(cleaned);
      },
      message: 'CNIC must be exactly 13 digits'
    }
  },
  
  // Contact Details
  phone: { type: String, required: false },
  email: { type: String, required: true }, // Keep for display, but NOT used for queries
  address: { type: String, required: false },
  
  // Education
  education: [EducationSchema],
  
  // Work Experience
  workExperience: [WorkExperienceSchema],
  
  // Skills
  skills: [{ type: String }],
  
  // Certifications
  certifications: [CertificationSchema],
  
  // Resume/CV
  resumePath: { type: String, required: false },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);

