import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { API_ENDPOINTS } from '../config/api';
import { showSuccess, showError } from '../utils/toast';

const Candidates = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const itemsPerPage = 10;

  const token = localStorage.getItem('token');
  const config = useMemo(() => ({ headers: { 'x-auth-token': token } }), [token]);

  const handleAuthError = useCallback((err) => {
    // Check if it's an authentication error
    if (err.response?.status === 401 || err.response?.data?.msg?.includes('token') || err.response?.data?.msg?.includes('authorization')) {
      localStorage.removeItem('token');
      navigate('/admin/login');
      return true;
    }
    return false;
  }, [navigate]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (statusFilter && statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      if (jobFilter && jobFilter !== 'All') {
        params.append('jobId', jobFilter);
      }
      
      const res = await axios.get(`${API_ENDPOINTS.ADMIN.APPLICATIONS}?${params.toString()}`, config);
      // Ensure applications is always an array
      const apps = res.data?.applications;
      setApplications(Array.isArray(apps) ? apps : []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalApplications(res.data?.totalApplications || 0);
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error loading applications: ' + (err.response?.data?.msg || err.message));
      }
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [config, handleAuthError, currentPage, debouncedSearchTerm, statusFilter, jobFilter, itemsPerPage]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId, newStatus, currentStatus) => {
    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to change the status from "${currentStatus}" to "${newStatus}"?`;
    if (!window.confirm(confirmMessage)) {
      // User cancelled - refresh to reset the dropdown to original value
      fetchApplications();
      return;
    }
    
    try {
      await axios.put(API_ENDPOINTS.ADMIN.APPLICATION_STATUS(applicationId), 
        { status: newStatus }, config);
      fetchApplications();
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error updating status: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleDeleteApplication = async (applicationId, candidateName) => {
    if (!window.confirm(`Are you sure you want to delete the application from ${candidateName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(API_ENDPOINTS.ADMIN.APPLICATION(applicationId), config);
      showSuccess('Application deleted successfully!');
      // Close modal if it was open
      if (selectedApplication && selectedApplication._id === applicationId) {
        setShowModal(false);
        setSelectedApplication(null);
      }
      fetchApplications();
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error deleting application: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleDownloadCSV = async (applicationId) => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.DOWNLOAD_CSV_APPLICATION(applicationId), {
        ...config,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application-${applicationId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error downloading CSV: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  // Fetch unique jobs for filter dropdown (separate API call or use existing data)
  const [uniqueJobs, setUniqueJobs] = useState([]);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.ADMIN.JOBS, config);
        setUniqueJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!handleAuthError(err)) {
          console.error('Error fetching jobs:', err);
        }
      }
    };
    fetchJobs();
  }, [config, handleAuthError]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, jobFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-800';
      case 'Reviewed': return 'bg-theme-blue/10 text-theme-blue';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 pt-20 lg:pt-8 lg:ml-64">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6 pt-20 lg:pt-8 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Candidates</h1>
          <p className="text-gray-600">View and manage all job applications</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
          >
            <option value="All">All Jobs</option>
            {uniqueJobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Candidate Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Job Applied For</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date Applied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No applications found. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:text-theme-blue"
                      onClick={() => handleViewDetails(app)}
                    >
                      {app.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{app.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{app.jobId?.title || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status || 'Pending'}
                        onChange={(e) => handleStatusChange(app._id, e.target.value, app.status || 'Pending')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(app.status || 'Pending')}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Selected">Selected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="text-theme-blue hover:text-theme-green text-sm font-semibold transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDownloadCSV(app._id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Download CSV
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app._id, app.fullName)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalApplications > 0 && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalApplications)}</span> of{' '}
                <span className="font-medium">{totalApplications}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-theme-blue text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Candidate Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 max-w-4xl w-full max-h-[90vh] candidate-details-modal" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .candidate-details-modal,
                  .candidate-details-modal * {
                    visibility: visible;
                  }
                  .candidate-details-modal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    max-height: none;
                    overflow: visible;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}</style>
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedApplication.fullName}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="no-print bg-theme-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-95 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedApplication(null);
                    }}
                    className="no-print text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <CandidateDetails application={selectedApplication} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CandidateDetails = ({ application }) => {
  const profile = application.profileId || {};

  const formatCnic = (value) => {
    const digitsOnly = String(value || '').replace(/[^\d]/g, '').slice(0, 13);
    if (digitsOnly.length !== 13) return String(value || 'N/A');
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
        
        {/* Line 1: Full Name | CNIC | Age | Gender */}
        <div className="text-sm mb-3 pb-3 border-b border-gray-200">
          <span className="font-medium text-gray-800">{application.fullName}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{formatCnic(profile.cnic)}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{calculateAge(profile.dateOfBirth)} years</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{profile.gender || 'N/A'}</span>
        </div>
        
        {/* Line 2: Phone Number | Email | Address */}
        <div className="text-sm">
          <span className="text-gray-700">{application.phone || 'N/A'}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{application.email}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{profile.address || 'N/A'}</span>
        </div>
        {profile.profilePicture && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-600">Profile Picture:</span>
              <div className="flex gap-2">
                {(() => {
                  let pictureUrl;
                  if (profile.profilePicture && typeof profile.profilePicture === 'object' && profile.profilePicture !== null) {
                    // It's an object - use preview_url or secure_url
                    pictureUrl = profile.profilePicture.preview_url || profile.profilePicture.secure_url || null;
                  } else if (typeof profile.profilePicture === 'string') {
                    // It's a string - check if it's a Cloudinary URL or local path
                    if (profile.profilePicture.startsWith('http://') || profile.profilePicture.startsWith('https://')) {
                      // It's already a full Cloudinary URL
                      pictureUrl = profile.profilePicture;
                    } else {
                      // Legacy local file path - construct uploads URL
                      pictureUrl = `${API_ENDPOINTS.UPLOADS.BASE}/${profile.profilePicture.replace(/^uploads[\\/]/, '')}`;
                    }
                  } else {
                    return null;
                  }

                  if (!pictureUrl) return null;

                  const downloadUrl = profile.profilePicture && typeof profile.profilePicture === 'object' && profile.profilePicture !== null
                    ? profile.profilePicture.download_url || profile.profilePicture.secure_url || pictureUrl
                    : pictureUrl;

                  return (
                    <>
                      <a
                        href={pictureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                      >
                        👁️ Preview
                      </a>
                      <span className="text-gray-400">|</span>
                      <a
                        href={downloadUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                      >
                        📥 Download
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>
            <img 
              src={(() => {
                if (profile.profilePicture && typeof profile.profilePicture === 'object' && profile.profilePicture !== null) {
                  return profile.profilePicture.preview_url || profile.profilePicture.secure_url || '';
                } else if (typeof profile.profilePicture === 'string') {
                  if (profile.profilePicture.startsWith('http://') || profile.profilePicture.startsWith('https://')) {
                    return profile.profilePicture;
                  } else {
                    return `${API_ENDPOINTS.UPLOADS.BASE}/${profile.profilePicture.replace(/^uploads[\\/]/, '')}`;
                  }
                }
                return '';
              })()} 
              alt="Profile" 
              className="mt-2 w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Education */}
      {profile.education && Array.isArray(profile.education) && profile.education.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Education</h4>
          <div className="space-y-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="border-l-4 border-theme-blue pl-4">
                <div className="font-medium">{edu.degree}</div>
                <div className="text-sm text-gray-600">{edu.institution}</div>
                <div className="text-sm text-gray-500">Year: {edu.yearOfCompletion} | Grade: {edu.grade}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {profile.workExperience && Array.isArray(profile.workExperience) && profile.workExperience.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Work Experience</h4>
          <div className="space-y-3">
            {profile.workExperience.map((exp, idx) => (
              <div key={idx} className="border-l-4 border-green-500 pl-4">
                <div className="font-medium">{exp.jobTitle} at {exp.companyName}</div>
                <div className="text-sm text-gray-600">
                  {exp.startDate} - {exp.isCurrentJob ? 'Present' : exp.endDate || 'N/A'}
                </div>
                {exp.responsibilities && (
                  <div className="text-sm text-gray-500 mt-1">{exp.responsibilities}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span key={idx} className="bg-theme-blue/10 text-theme-blue px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {profile.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Certifications</h4>
          <div className="space-y-2">
            {profile.certifications.map((cert, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{cert.name}</span>
                {cert.issuingOrganization && (
                  <span className="text-gray-600"> - {cert.issuingOrganization}</span>
                )}
                {cert.issueDate && (
                  <span className="text-gray-500"> ({cert.issueDate})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3">Documents</h4>
        <div className="space-y-3">
          {(() => {
            // Use application CV if available, otherwise use profile resume
            const cvData = application.cvPath || profile.resumePath;
            if (!cvData) return null;

            // Handle both string URLs and normalized objects
            let cvUrl, downloadUrl, resumeName = 'Resume.pdf';
            
            if (typeof cvData === 'object' && cvData !== null) {
              // It's a normalized object with preview_url and download_url
              cvUrl = cvData.preview_url || cvData.secure_url;
              downloadUrl = cvData.download_url || cvData.secure_url || cvUrl;
              // Extract filename from resume object
              if (cvData.original_filename) {
                resumeName = `${cvData.original_filename}.${cvData.format || 'pdf'}`;
              } else if (cvData.public_id) {
                try {
                  resumeName = decodeURIComponent(cvData.public_id.split('/').pop());
                } catch (e) {
                  resumeName = 'Resume.pdf';
                }
              }
            } else if (typeof cvData === 'string') {
              // It's a string URL - use it for both view and download
              // The backend should normalize it, but if not, use the string directly
              cvUrl = cvData;
              downloadUrl = cvData;
              try {
                resumeName = decodeURIComponent(cvData.split('/').pop());
              } catch (e) {
                resumeName = 'Resume.pdf';
              }
            } else {
              return null;
            }

            if (!cvUrl) return null;

            return (
              <div>
                <span className="text-gray-600 text-sm">CV/Resume:</span>
                <div className="mt-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    📄 {resumeName}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                    >
                      👁️ View CV
                    </a>
                    <span className="text-gray-400">|</span>
                    <a
                      href={downloadUrl}
                      download
                      className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                    >
                      📥 Download CV
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Application Details - Footer */}
      <div className="bg-gray-50 p-4 rounded-lg border-t-2 border-theme-blue">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Minimum Salary:</span> <span className="font-medium">{application.minimumSalary || 'Not specified'}</span>
          <span className="text-gray-400 mx-3">|</span>
          <span className="font-semibold">Expected Salary:</span> <span className="font-medium">{application.expectedSalary || 'Not specified'}</span>
          <span className="text-gray-400 mx-3">|</span>
          <span className="font-semibold">Date Applied:</span> <span className="font-medium">
            {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Candidates;

