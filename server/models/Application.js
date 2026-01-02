const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    // PRIMARY IDENTIFIER - Link to Candidate (DO NOT TRUST EMAIL FROM FRONTEND)
    candidateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Candidate', 
        required: true 
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true }, // Keep for display/admin, but NOT used for queries
    phone: { type: String, required: true },
    education: { type: String, required: true },
    cvPath: { type: String, required: true },
    minimumSalary: { type: String },
    expectedSalary: { type: String },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Rejected', 'Selected'], default: 'Pending' },
    appliedAt: { type: Date, default: Date.now }
});

// STRICT UNIQUE CONSTRAINT: One application per candidate per job (database-level enforcement)
ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);