import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { API_ENDPOINTS } from '../config/api';
import { showSuccess, showError } from '../utils/toast';

const RegisteredEmails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterVerified, setFilterVerified] = useState('All'); // All, Verified, Unverified
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      const res = await axios.get(API_ENDPOINTS.ADMIN.REGISTERED_EMAILS, config);
      setCandidates(res.data);
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error loading registered emails: ' + (err.response?.data?.msg || err.message));
      }
    } finally {
      setLoading(false);
    }
  }, [config, handleAuthError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const handleViewDetails = async (candidate) => {
    if (!candidate?._id) return;
    setLoadingDetails(true);
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.CANDIDATE_DETAILS(candidate._id), config);
      setSelectedCandidate(res.data);
      setShowDetailsModal(true);
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error loading candidate details: ' + (err.response?.data?.msg || err.message));
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;

    setDeletingId(candidateToDelete._id);
    try {
      await axios.delete(API_ENDPOINTS.ADMIN.DELETE_CANDIDATE(candidateToDelete._id), config);
      showSuccess('Candidate and all associated data deleted successfully!');
      setShowDeleteModal(false);
      setCandidateToDelete(null);
      fetchCandidates(); // Refresh the list
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error deleting candidate: ' + (err.response?.data?.msg || err.message));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.profileId?.fullName && candidate.profileId.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterVerified === 'All' || 
                         (filterVerified === 'Verified' && candidate.emailVerified) ||
                         (filterVerified === 'Unverified' && !candidate.emailVerified);
    return matchesSearch && matchesFilter;
  });

  const verifiedCount = candidates.filter(c => c.emailVerified).length;
  const unverifiedCount = candidates.filter(c => !c.emailVerified).length;

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 pt-20 lg:pt-8 lg:ml-64">
          <div className="text-center">Loading registered emails...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6 pt-20 lg:pt-8 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Registered Emails</h1>
          <p className="text-gray-600">Manage all registered candidate emails</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Registered</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{candidates.length}</p>
              </div>
              <div className="bg-theme-blue/10 p-3 rounded-full">
                <span className="text-2xl">📧</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verified</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{verifiedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Unverified</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{unverifiedCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
              />
            </div>
            <div>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
              >
                <option value="All">All Emails</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No registered emails found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {candidate.profileId?.fullName ? (
                            <button
                              type="button"
                              onClick={() => handleViewDetails(candidate)}
                              disabled={loadingDetails}
                              className="text-theme-blue hover:text-theme-green font-semibold underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              {candidate.profileId.fullName}
                            </button>
                          ) : (
                            'No profile'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            candidate.emailVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {candidate.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.applicationCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.registeredAt
                          ? new Date(candidate.registeredAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(candidate)}
                          disabled={deletingId === candidate._id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {deletingId === candidate._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && candidateToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 max-w-md w-full max-h-[90vh]" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Confirm Deletion</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the candidate <strong>{candidateToDelete.email}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This will permanently delete:
                <ul className="list-disc list-inside mt-2">
                  <li>The candidate account</li>
                  <li>Associated profile (if exists)</li>
                  <li>All job applications ({candidateToDelete.applicationCount || 0})</li>
                </ul>
                <strong className="text-red-600">This action cannot be undone.</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId === candidateToDelete._id}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deletingId === candidateToDelete._id ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCandidateToDelete(null);
                  }}
                  disabled={deletingId === candidateToDelete._id}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Details Modal */}
        {showDetailsModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 max-w-4xl w-full max-h-[90vh]" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Candidate Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCandidate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <CandidateDetails candidate={selectedCandidate} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CandidateDetails = ({ candidate }) => {
  const profile = candidate?.profileId || {};

  const resolveFileUrls = (fileValue) => {
    if (!fileValue) return { previewUrl: null, downloadUrl: null, filename: null };

    if (typeof fileValue === 'object' && fileValue !== null) {
      const previewUrl = fileValue.preview_url || fileValue.secure_url || null;
      const downloadUrl = fileValue.download_url || fileValue.secure_url || previewUrl;
      const filename = fileValue.original_filename || null;
      return { previewUrl, downloadUrl, filename };
    }

    if (typeof fileValue === 'string') {
      if (fileValue.startsWith('http://') || fileValue.startsWith('https://')) {
        const filename = fileValue.split('/').pop() || null;
        return { previewUrl: fileValue, downloadUrl: fileValue, filename };
      }

      const normalized = fileValue.replace(/^uploads[\\/]/, '');
      const previewUrl = `${API_ENDPOINTS.UPLOADS.BASE}/${normalized}`;
      const filename = normalized.split('/').pop() || null;
      return { previewUrl, downloadUrl: previewUrl, filename };
    }

    return { previewUrl: null, downloadUrl: null, filename: null };
  };

  const formatCnic = (value) => {
    const digitsOnly = String(value || '').replace(/[^\d]/g, '').slice(0, 13);
    if (digitsOnly.length !== 13) return String(value || 'N/A');
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3">Account</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">{candidate?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Applications:</span>
            <span className="ml-2 font-medium">{candidate?.applicationCount ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3">Profile</h4>
        {!profile || Object.keys(profile).length === 0 ? (
          <p className="text-sm text-gray-500">No profile found for this candidate.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Full Name:</span>
              <span className="ml-2 font-medium">{profile.fullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Cell Number:</span>
              <span className="ml-2 font-medium">{profile.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">CNIC:</span>
              <span className="ml-2 font-medium">{formatCnic(profile.cnic)}</span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 font-medium">{profile.gender || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <span className="ml-2 font-medium">{profile.dateOfBirth || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Address:</span>
              <span className="ml-2 font-medium">{profile.address || 'N/A'}</span>
            </div>

            {(profile.profilePicture || profile.resumePath) && (
              <div className="col-span-2 border-t pt-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Profile Picture:</span>
                    {(() => {
                      const { previewUrl, downloadUrl } = resolveFileUrls(profile.profilePicture);
                      if (!previewUrl) return <span className="ml-2 font-medium">N/A</span>;

                      return (
                        <div className="mt-2">
                          <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                            >
                              Preview
                            </a>
                            <span className="text-gray-400">|</span>
                            <a
                              href={downloadUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">CV / Resume:</span>
                    {(() => {
                      const { previewUrl, downloadUrl, filename } = resolveFileUrls(profile.resumePath);
                      if (!previewUrl) return <span className="ml-2 font-medium">N/A</span>;

                      return (
                        <div className="mt-2">
                          {filename ? (
                            <div className="text-gray-700 font-medium mb-2 break-all">{filename}</div>
                          ) : null}
                          <div className="flex items-center gap-2">
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                            >
                              Open
                            </a>
                            <span className="text-gray-400">|</span>
                            <a
                              href={downloadUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="text-theme-blue hover:text-theme-green text-sm font-semibold underline transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredEmails;

