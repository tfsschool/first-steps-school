import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { API_ENDPOINTS } from '../config/api';
import { showSuccess, showError } from '../utils/toast';

const AdminCandidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');
  const config = useMemo(() => ({ headers: { 'x-auth-token': token } }), [token]);

  const handleAuthError = useCallback((err) => {
    if (err.response?.status === 401 || err.response?.data?.msg?.includes('token') || err.response?.data?.msg?.includes('authorization')) {
      localStorage.removeItem('token');
      navigate('/admin/login');
      return true;
    }
    return false;
  }, [navigate]);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.ADMIN.REGISTERED_EMAILS, config);
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error loading candidates: ' + (err.response?.data?.msg || err.message));
      }
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [config, handleAuthError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleViewDetails = async (candidate) => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.CANDIDATE_DETAILS(candidate._id), config);
      setSelectedCandidate(res.data);
      setShowModal(true);
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error loading candidate details: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Candidates</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-theme-blue"></div>
                <p className="mt-4 text-gray-600">Loading candidates...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Verified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Registered Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {candidates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No candidates found.
                        </td>
                      </tr>
                    ) : (
                      candidates.map(candidate => (
                        <tr key={candidate._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-700">{candidate.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {candidate.profileId?.fullName || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              candidate.emailVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {candidate.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(candidate.registeredAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewDetails(candidate)}
                              className="text-theme-blue hover:text-theme-green text-sm font-semibold transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Candidate Details Modal */}
          {showModal && selectedCandidate && (
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
                    {selectedCandidate.profileId?.fullName || selectedCandidate.email}
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
                        setSelectedCandidate(null);
                      }}
                      className="no-print text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <CandidateDetails candidate={selectedCandidate} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CandidateDetails = ({ candidate }) => {
  const profile = candidate.profileId || {};

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
          <span className="font-medium text-gray-800">{profile.fullName || 'N/A'}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{formatCnic(profile.cnic)}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{calculateAge(profile.dateOfBirth)} years</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{profile.gender || 'N/A'}</span>
        </div>
        
        {/* Line 2: Phone Number | Email | Address */}
        <div className="text-sm">
          <span className="text-gray-700">{profile.phone || 'N/A'}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-700">{candidate.email}</span>
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
                    pictureUrl = profile.profilePicture.preview_url || profile.profilePicture.secure_url || null;
                  } else if (typeof profile.profilePicture === 'string') {
                    if (profile.profilePicture.startsWith('http://') || profile.profilePicture.startsWith('https://')) {
                      pictureUrl = profile.profilePicture;
                    } else {
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
      {profile.resumePath && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Documents</h4>
          <div className="space-y-3">
            {(() => {
              const cvData = profile.resumePath;
              if (!cvData) return null;

              let cvUrl, downloadUrl, resumeName = 'Resume.pdf';
              
              if (typeof cvData === 'object' && cvData !== null) {
                cvUrl = cvData.preview_url || cvData.secure_url;
                downloadUrl = cvData.download_url || cvData.secure_url || cvUrl;
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
      )}

      {/* Application History - Footer */}
      <div className="bg-gray-50 p-4 rounded-lg border-t-2 border-theme-blue">
        <h4 className="font-semibold text-gray-700 mb-3">Application History</h4>
        {candidate.applications && Array.isArray(candidate.applications) && candidate.applications.length > 0 ? (
          <div className="space-y-2">
            {candidate.applications.map((app, idx) => (
              <div key={idx} className="text-sm text-gray-700 py-2 border-b border-gray-200 last:border-b-0">
                <span className="font-medium">{app.jobId?.title || 'N/A'}</span>
                <span className="text-gray-400 mx-2">|</span>
                <span>{app.minimumSalary || 'N/A'}</span>
                <span className="text-gray-400 mx-2">|</span>
                <span>{app.expectedSalary || 'N/A'}</span>
                <span className="text-gray-400 mx-2">|</span>
                <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No applications found for this candidate.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCandidates;
