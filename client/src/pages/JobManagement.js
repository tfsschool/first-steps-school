import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { API_ENDPOINTS } from '../config/api';
import { showSuccess, showError } from '../utils/toast';

const JobManagement = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Open'
  });

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

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.JOBS, config);
      // Ensure res.data is an array
      setJobs(Array.isArray(res.data) ? res.data : []);
      
      // Fetch applicant counts for each job
      const counts = {};
      const jobsArray = Array.isArray(res.data) ? res.data : [];
      for (const job of jobsArray) {
        try {
          const appsRes = await axios.get(API_ENDPOINTS.ADMIN.APPLICATIONS_BY_JOB(job._id), config);
          counts[job._id] = appsRes.data.length;
        } catch (err) {
          if (!handleAuthError(err)) {
            counts[job._id] = 0;
          }
        }
      }
      setApplicantCounts(counts);
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error loading jobs: ' + (err.response?.data?.msg || err.message));
      }
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [config, handleAuthError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await axios.put(API_ENDPOINTS.ADMIN.JOB(editingJob._id), formData, config);
        showSuccess('Job updated successfully!');
      } else {
        await axios.post(API_ENDPOINTS.ADMIN.JOB(), formData, config);
        showSuccess('Job posted successfully!');
      }
      setShowModal(false);
      setEditingJob(null);
      setFormData({
        title: '',
        description: '',
        status: 'Open'
      });
      fetchJobs();
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error saving job: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      status: job.status || 'Open'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await axios.delete(API_ENDPOINTS.ADMIN.JOB(id), config);
      showSuccess('Job deleted successfully!');
      fetchJobs();
    } catch (err) {
      if (!handleAuthError(err)) {
        showError('Error deleting job: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Job Management</h1>
            <p className="text-gray-600 mt-1">Create, update, and manage job postings</p>
          </div>
          <button
            onClick={() => {
              setEditingJob(null);
      setFormData({
        title: '',
        description: '',
        status: 'Open'
      });
              setShowModal(true);
            }}
            className="bg-theme-blue text-white px-6 py-2 rounded-lg hover:brightness-95 transition font-semibold"
          >
            + Add New Job
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
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
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Applicants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No jobs found. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-theme-blue/10 text-theme-blue">
                        {applicantCounts[job._id] !== undefined ? applicantCounts[job._id] : 0} applicant{applicantCounts[job._id] !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          job.status === 'Open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="text-theme-blue hover:text-theme-green text-sm font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
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
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl shadow-soft border border-gray-100 max-w-2xl w-full max-h-[90vh]"
              style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingJob ? 'Edit Job' : 'Add New Job'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingJob(null);
                  }}
                  className="h-10 w-10 rounded-full grid place-items-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingJob(null);
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-theme-blue text-white rounded-lg hover:brightness-95 font-semibold transition"
                  >
                    {editingJob ? 'Update' : 'Create'} Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManagement;

