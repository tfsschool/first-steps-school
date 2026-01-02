const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Job = require('../models/Job');
const Application = require('../models/Application');
const UserProfile = require('../models/UserProfile');
const Candidate = require('../models/Candidate');
const adminAuth = require('../middleware/adminAuth');

// 1. Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        let admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { admin: { id: admin.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 2. Add Job (Protected)
router.post('/job', adminAuth, async (req, res) => {
    try {
        if (!req.body.title || !req.body.description) {
            return res.status(400).json({ msg: 'Title and description are required' });
        }
        const newJob = new Job({
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            department: req.body.department?.trim() || '',
            location: req.body.location?.trim() || '',
            type: req.body.type || 'Full Time',
            status: req.body.status || 'Open'
        });
        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error('Error adding job:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 2b. Update Job (Protected)
router.put('/job/:id', adminAuth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        if (req.body.title) job.title = req.body.title.trim();
        if (req.body.description) job.description = req.body.description.trim();
        if (req.body.department) job.department = req.body.department.trim();
        if (req.body.location) job.location = req.body.location.trim();
        if (req.body.type) job.type = req.body.type;
        if (req.body.status) job.status = req.body.status;
        job.updatedAt = new Date();

        await job.save();
        res.json(job);
    } catch (err) {
        console.error('Error updating job:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 3. Delete Job (Protected)
router.delete('/job/:id', adminAuth, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.json({ msg: 'Job Removed' });
    } catch (err) {
        console.error('Error deleting job:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 4. Get All Jobs for Admin (Protected)
router.get('/jobs', adminAuth, async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        // Always return an array
        res.json(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json([]);
    }
});

// 5. Get All Registered Candidates (Protected) - MUST come before /applications routes
router.get('/candidates', adminAuth, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('=== GET /api/admin/candidates ===');
        }
        const candidates = await Candidate.find()
            .sort({ registeredAt: -1 })
            .populate('profileId', 'fullName phone cnic')
            .lean();
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`Found ${candidates.length} candidates`);
        }
        
        // Get application count for each candidate
        const candidatesWithStats = await Promise.all(
            candidates.map(async (candidate) => {
                const applicationCount = await Application.countDocuments({ 
                    candidateId: candidate._id 
                });
                return {
                    ...candidate,
                    applicationCount
                };
            })
        );
        
        if (process.env.NODE_ENV === 'development') {
            console.log('Returning candidates with stats');
        }
        // Always return an array
        res.json(Array.isArray(candidatesWithStats) ? candidatesWithStats : []);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        // Return empty array on error to prevent frontend crashes
        res.status(500).json([]);
    }
});

// 5a. Get All Applications (Protected) - for admin to see all applications with pagination and filtering
router.get('/applications', adminAuth, async (req, res) => {
    try {
        const { normalizeFileData } = require('../config/cloudinary');
        
        // Extract query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const jobId = req.query.jobId || '';
        
        // Build query object
        const query = {};
        
        // Search filter (name or email)
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Status filter
        if (status && status !== 'All') {
            query.status = status;
        }
        
        // Job filter
        if (jobId && jobId !== 'All' && mongoose.Types.ObjectId.isValid(jobId)) {
            query.jobId = new mongoose.Types.ObjectId(jobId);
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Get total count for pagination
        const totalApplications = await Application.countDocuments(query);
        
        // Fetch applications with pagination
        const apps = await Application.find(query)
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('jobId', 'title')
            .populate('profileId');
        
        // Normalize CV paths for all applications
        const normalizedApps = apps.map(app => {
            const appData = app.toObject();
            if (appData.cvPath) {
                appData.cvPath = normalizeFileData(appData.cvPath) || appData.cvPath;
            }
            if (appData.profileId && appData.profileId.resumePath) {
                appData.profileId.resumePath = normalizeFileData(appData.profileId.resumePath) || appData.profileId.resumePath;
            }
            return appData;
        });
        
        // Calculate total pages
        const totalPages = Math.ceil(totalApplications / limit);
        
        res.json({
            applications: Array.isArray(normalizedApps) ? normalizedApps : [],
            totalApplications,
            totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error('Error fetching all applications:', err);
        // Return safe paginated structure on error
        res.status(500).json({
            applications: [],
            totalApplications: 0,
            totalPages: 1,
            currentPage: 1
        });
    }
});

// 5a. Update Application Status (Protected) - MUST come before /applications/:jobId
router.put('/application/:id/status', adminAuth, async (req, res) => {
    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid application ID' });
        }

        const { status } = req.body;
        if (!['Pending', 'Reviewed', 'Rejected', 'Selected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        application.status = status;
        await application.save();
        
        // Normalize CV path before returning
        const { normalizeFileData } = require('../config/cloudinary');
        const appData = application.toObject();
        if (appData.cvPath) {
            appData.cvPath = normalizeFileData(appData.cvPath) || appData.cvPath;
        }
        if (appData.profileId && appData.profileId.resumePath) {
            appData.profileId.resumePath = normalizeFileData(appData.profileId.resumePath) || appData.profileId.resumePath;
        }
        res.json(appData);
    } catch (err) {
        console.error('Error updating application status:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 5b. Delete Application (Protected) - MUST come before /applications/:jobId
router.delete('/application/:id', adminAuth, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('=== DELETE Application Request ===');
            console.log('Application ID:', req.params.id);
            console.log('Request method:', req.method);
            console.log('Request path:', req.path);
        }
        
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Invalid ObjectId format');
            }
            return res.status(400).json({ msg: 'Invalid application ID' });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Application not found in database');
            }
            return res.status(404).json({ msg: 'Application not found' });
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Deleting application:', application._id);
        }
        await Application.findByIdAndDelete(req.params.id);
        if (process.env.NODE_ENV === 'development') {
            console.log('Application deleted successfully');
        }
        res.json({ msg: 'Application deleted successfully' });
    } catch (err) {
        console.error('Error deleting application:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 5c. Get Applications for a Job (Protected) - MUST come after /application/:id routes
router.get('/applications/:jobId', adminAuth, async (req, res) => {
    try {
        // Convert jobId to ObjectId for proper querying
        if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
            return res.status(400).json({ msg: 'Invalid job ID' });
        }

        const { normalizeFileData } = require('../config/cloudinary');
        const jobId = new mongoose.Types.ObjectId(req.params.jobId);
        const apps = await Application.find({ jobId: jobId })
            .populate('profileId')
            .sort({ appliedAt: -1 });
        
        // Normalize CV paths for all applications
        const normalizedApps = apps.map(app => {
            const appData = app.toObject();
            if (appData.cvPath) {
                appData.cvPath = normalizeFileData(appData.cvPath) || appData.cvPath;
            }
            if (appData.profileId && appData.profileId.resumePath) {
                appData.profileId.resumePath = normalizeFileData(appData.profileId.resumePath) || appData.profileId.resumePath;
            }
            return appData;
        });
        
        // Always return an array
        res.json(Array.isArray(normalizedApps) ? normalizedApps : []);
    } catch (err) {
        console.error('Error fetching applications:', err);
        // Return empty array on error
        res.status(500).json([]);
    }
});

// 6. Download CSV for Job (Protected)
router.get('/download-csv/:jobId', adminAuth, async (req, res) => {
    try {
        const formatCnic = (value) => {
            const digitsOnly = String(value || '').replace(/[^\d]/g, '').slice(0, 13);
            if (digitsOnly.length !== 13) return value || 'N/A';
            return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
        };

        if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
            return res.status(400).json({ msg: 'Invalid job ID' });
        }

        const jobId = new mongoose.Types.ObjectId(req.params.jobId);
        const apps = await Application.find({ jobId: jobId })
            .populate('profileId')
            .sort({ appliedAt: -1 });
        
        if (apps.length === 0) {
            return res.status(404).json({ msg: 'No applicants found for this job' });
        }
        
        // Enhanced CSV with full profile data
        const csvData = apps.map(app => {
            const profile = app.profileId || {};
            return {
                'Full Name': app.fullName,
                'Email': app.email,
                'Cell Number': app.phone,
                'CNIC': formatCnic(profile.cnic),
                'Date of Birth': profile.dateOfBirth || 'N/A',
                'Gender': profile.gender || 'N/A',
                'Address': profile.address || 'N/A',
                'Education': app.education || 'N/A',
                'Education Details': profile.education ? JSON.stringify(profile.education) : 'N/A',
                'Work Experience': profile.workExperience ? JSON.stringify(profile.workExperience) : 'N/A',
                'Skills': profile.skills ? profile.skills.join(', ') : 'N/A',
                'Certifications': profile.certifications ? JSON.stringify(profile.certifications) : 'N/A',
                'Minimum Salary': app.minimumSalary || 'N/A',
                'Expected Salary': app.expectedSalary || 'N/A',
                'Status': app.status || 'Pending',
                'Applied Date': new Date(app.appliedAt).toLocaleString()
            };
        });

        const fields = ['Full Name', 'Email', 'Cell Number', 'CNIC', 'Date of Birth', 'Gender', 
                       'Address', 'Education', 'Education Details', 'Work Experience', 'Skills', 
                       'Certifications', 'Minimum Salary', 'Expected Salary', 'Status', 'Applied Date'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`applicants-${req.params.jobId}.csv`);
        return res.send(csv);
    } catch (err) { 
        console.error('Error generating CSV:', err);
        res.status(500).json({ msg: 'Error generating CSV', error: err.message }); 
    }
});

// 6b. Download CSV for Single Application (Protected)
router.get('/download-csv-application/:applicationId', adminAuth, async (req, res) => {
    try {
        const formatCnic = (value) => {
            const digitsOnly = String(value || '').replace(/[^\d]/g, '').slice(0, 13);
            if (digitsOnly.length !== 13) return value || 'N/A';
            return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
        };

        if (!mongoose.Types.ObjectId.isValid(req.params.applicationId)) {
            return res.status(400).json({ msg: 'Invalid application ID' });
        }

        const app = await Application.findById(req.params.applicationId)
            .populate('profileId')
            .populate('jobId', 'title');
        
        if (!app) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const profile = app.profileId || {};
        const csvData = [{
            'Full Name': app.fullName,
            'Email': app.email,
            'Cell Number': app.phone,
            'Job Applied For': app.jobId?.title || 'N/A',
            'CNIC': formatCnic(profile.cnic),
            'Date of Birth': profile.dateOfBirth || 'N/A',
            'Gender': profile.gender || 'N/A',
            'Address': profile.address || 'N/A',
            'Education': app.education || 'N/A',
            'Education Details': profile.education ? JSON.stringify(profile.education) : 'N/A',
            'Work Experience': profile.workExperience ? JSON.stringify(profile.workExperience) : 'N/A',
            'Skills': profile.skills ? profile.skills.join(', ') : 'N/A',
            'Certifications': profile.certifications ? JSON.stringify(profile.certifications) : 'N/A',
            'Minimum Salary': app.minimumSalary || 'N/A',
            'Expected Salary': app.expectedSalary || 'N/A',
            'Status': app.status || 'Pending',
            'Applied Date': new Date(app.appliedAt).toLocaleString()
        }];

        const fields = ['Full Name', 'Email', 'Cell Number', 'Job Applied For', 'CNIC', 'Date of Birth', 
                       'Gender', 'Address', 'Education', 'Education Details', 
                       'Work Experience', 'Skills', 'Certifications', 'Minimum Salary', 'Expected Salary', 'Status', 'Applied Date'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`application-${app.fullName.replace(/\s+/g, '-')}-${req.params.applicationId}.csv`);
        return res.send(csv);
    } catch (err) { 
        console.error('Error generating CSV:', err);
        res.status(500).json({ msg: 'Error generating CSV', error: err.message }); 
    }
});

// 7. Get Admin Stats (Protected)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [jobs, applications, candidates] = await Promise.all([
            Job.find().lean(),
            Application.find().lean(),
            Candidate.find().lean()
        ]);

        const stats = {
            totalJobs: jobs.length,
            openJobs: jobs.filter(j => j.status === 'Open').length,
            totalApplications: applications.length,
            pendingApplications: applications.filter(a => a.status === 'Pending').length,
            totalRegisteredEmails: candidates.length,
            verifiedEmails: candidates.filter(c => c.emailVerified).length
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 8. Delete Candidate (Protected)
router.delete('/candidate/:id', adminAuth, async (req, res) => {
    try {
        const candidateId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
            return res.status(400).json({ msg: 'Invalid candidate ID' });
        }

        // Find candidate
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ msg: 'Candidate not found' });
        }

        // Delete associated profile if exists
        if (candidate.profileId) {
            await UserProfile.findByIdAndDelete(candidate.profileId);
        }

        // Delete all applications by this candidate
        await Application.deleteMany({ candidateId: candidateId });

        // Delete the candidate
        await Candidate.findByIdAndDelete(candidateId);

        res.json({ 
            msg: 'Candidate and all associated data deleted successfully',
            deletedCandidate: {
                email: candidate.email,
                candidateId: candidateId
            }
        });
    } catch (err) {
        console.error('Error deleting candidate:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// 9. Get Single Candidate Details (Protected)
router.get('/candidate/:id', adminAuth, async (req, res) => {
    try {
        const candidateId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
            return res.status(400).json({ msg: 'Invalid candidate ID' });
        }

        const candidate = await Candidate.findById(candidateId)
            .populate('profileId')
            .lean();

        if (!candidate) {
            return res.status(404).json({ msg: 'Candidate not found' });
        }

        const applicationCount = await Application.countDocuments({
            candidateId: candidate._id
        });

        res.json({
            ...candidate,
            applicationCount
        });
    } catch (err) {
        console.error('Error fetching candidate details:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;