const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, default: '' },
    location: { type: String, default: '' },
    salary: { type: String, default: '' },
    requirements: { type: String, default: '' },
    type: { type: String, default: 'Full Time' },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);