import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { API_ENDPOINTS } from '../config/api';

const Candidates = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');

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
      const res = await axios.get(API_ENDPOINTS.ADMIN.APPLICATIONS, config);
      setApplications(res.data);
    } catch (err) {
      if (!handleAuthError(err)) {
        alert('Error loading applications: ' + (err.response?.data?.msg || err.message));
      }
    } finally {
      setLoading(false);
    }
  }, [config, handleAuthError]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(API_ENDPOINTS.ADMIN.APPLICATION_STATUS(applicationId), 
        { status: newStatus }, config);
      fetchApplications();
    } catch (err) {
      if (!handleAuthError(err)) {
        alert('Error updating status: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleDeleteApplication = async (applicationId, candidateName) => {
    if (!window.confirm(`Are you sure you want to delete the application from ${candidateName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(API_ENDPOINTS.ADMIN.APPLICATION(applicationId), config);
      alert('Application deleted successfully!');
      // Close modal if it was open
      if (selectedApplication && selectedApplication._id === applicationId) {
        setShowModal(false);
        setSelectedApplication(null);
      }
      fetchApplications();
    } catch (err) {
      if (!handleAuthError(err)) {
        alert('Error deleting application: ' + (err.response?.data?.msg || err.message));
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
        alert('Error downloading CSV: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  // Get unique jobs for filter
  const uniqueJobs = useMemo(() => {
    const jobs = applications.map(app => app.jobId).filter(Boolean);
    return [...new Set(jobs.map(job => job._id))].map(id => 
      jobs.find(j => j._id === id)
    );
  }, [applications]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.jobId?.title && app.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesJob = jobFilter === 'All' || app.jobId?._id === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-800';
      case 'Reviewed': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Candidates</h1>
          <p className="text-gray-600">View and manage all job applications</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Jobs</option>
            {uniqueJobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
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
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
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
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
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
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

        {/* Candidate Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh]" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Candidate Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedApplication(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
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

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">CNIC/National ID:</span>
            <span className="ml-2 font-medium">{profile.cnic || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Date of Birth:</span>
            <span className="ml-2 font-medium">{profile.dateOfBirth || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium">{profile.gender || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Nationality:</span>
            <span className="ml-2 font-medium">{profile.nationality || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Address:</span>
            <span className="ml-2 font-medium">{profile.address || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 font-medium">{application.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">{application.email}</span>
          </div>
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
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        👁️ Preview
                      </a>
                      <span className="text-gray-400">|</span>
                      <a
                        href={downloadUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
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
      {profile.education && profile.education.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Education</h4>
          <div className="space-y-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium">{edu.degree}</div>
                <div className="text-sm text-gray-600">{edu.institution}</div>
                <div className="text-sm text-gray-500">Year: {edu.yearOfCompletion} | Grade: {edu.grade}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {profile.workExperience && profile.workExperience.length > 0 && (
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
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
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

            // Determine the preview URL
            let cvUrl;
            if (cvData && typeof cvData === 'object' && cvData !== null) {
              // It's an object - use preview_url or secure_url
              cvUrl = cvData.preview_url || cvData.secure_url || null;
            } else if (typeof cvData === 'string') {
              // It's a string - check if it's a Cloudinary URL or local path
              if (cvData.startsWith('http://') || cvData.startsWith('https://')) {
                // It's already a full Cloudinary URL
                cvUrl = cvData;
              } else {
                // Legacy local file path - construct uploads URL
                cvUrl = `${API_ENDPOINTS.UPLOADS.BASE}/${cvData.replace(/^uploads[\\/]/, '')}`;
              }
            } else {
              // Fallback - shouldn't happen, but handle gracefully
              console.error('Unexpected cvData type:', typeof cvData, cvData);
              return null;
            }

            if (!cvUrl) return null;
            
            // For download, ensure PDF extension is preserved
            let downloadUrl;
            if (cvData && typeof cvData === 'object' && cvData !== null) {
              // Use download_url or secure_url from object
              downloadUrl = cvData.download_url || cvData.secure_url || cvUrl;
            } else {
              // Use the same URL for download if it's a string
              downloadUrl = cvUrl;
            }
            
            // Ensure download URL has .pdf extension for PDFs
            const isPdf = cvData && typeof cvData === 'object' && cvData !== null
              ? (cvData.format === 'pdf' || cvData.resource_type === 'raw')
              : (cvUrl.toLowerCase().includes('.pdf') || cvUrl.toLowerCase().includes('/raw/'));
            
            // Add .pdf extension if it's a PDF and doesn't have it
            if (isPdf && downloadUrl && !downloadUrl.toLowerCase().endsWith('.pdf')) {
              downloadUrl = downloadUrl + '.pdf';
            }
            
            // Get filename for download attribute
            const filename = cvData && typeof cvData === 'object' && cvData !== null && cvData.original_filename
              ? cvData.original_filename
              : 'resume.pdf';

            return (
              <div>
                <span className="text-gray-600 text-sm">CV/Resume:</span>
                <div className="flex gap-2 mt-1">
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    👁️ View CV
                  </a>
                  <span className="text-gray-400">|</span>
                  <a
                    href={downloadUrl}
                    download={isPdf ? (filename.endsWith('.pdf') ? filename : filename + '.pdf') : filename}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    📥 Download CV
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Candidates;

