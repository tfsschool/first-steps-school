const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: { 
    type: String 
  },
  verificationTokenExpiry: { 
    type: Date 
  },
  loginToken: {
    type: String
  },
  loginTokenExpiry: {
    type: Date
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  profileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserProfile' 
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);

