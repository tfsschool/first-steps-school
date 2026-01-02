import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { API_ENDPOINTS } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalRegisteredEmails: 0,
    verifiedEmails: 0
  });
  const [loading, setLoading] = useState(true);

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
      
      // Check for HTML response (routing error)
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        console.error('❌ API Routing Error: /api/admin/jobs returned HTML instead of JSON');
        console.error('This means the API request is being handled by frontend routing, not the backend.');
        return;
      }
      
      const jobs = Array.isArray(res.data) ? res.data : [];
      if (!Array.isArray(res.data)) {
        console.warn('Warning: fetchJobs received non-array data:', typeof res.data);
      }
      const totalJobs = jobs.length;
      const openJobs = jobs.filter(j => j.status === 'Open').length;
      setStats(prev => ({
        ...prev,
        totalJobs,
        openJobs
      }));
    } catch (err) {
      if (!handleAuthError(err)) {
        console.error('Error loading jobs:', err);
      }
    }
  }, [config, handleAuthError]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.APPLICATIONS, config);
      
      // Check for HTML response (routing error)
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        console.error('❌ API Routing Error: /api/admin/applications returned HTML instead of JSON');
        console.error('This means the API request is being handled by frontend routing, not the backend.');
        return;
      }
      
      const applications = Array.isArray(res.data?.applications) ? res.data.applications : [];
      if (!Array.isArray(res.data?.applications)) {
        console.warn('Warning: fetchApplications received non-array data:', typeof res.data?.applications);
      }
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(a => a.status === 'Pending').length;
      setStats(prev => ({
        ...prev,
        totalApplications,
        pendingApplications
      }));
    } catch (err) {
      if (!handleAuthError(err)) {
        console.error('Error loading applications:', err);
      }
    }
  }, [config, handleAuthError]);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN.REGISTERED_EMAILS, config);
      
      // Check for HTML response (routing error)
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        console.error('❌ API Routing Error: /api/admin/candidates returned HTML instead of JSON');
        console.error('This means the API request is being handled by frontend routing, not the backend.');
        return;
      }
      
      const candidates = Array.isArray(res.data) ? res.data : [];
      if (!Array.isArray(res.data)) {
        console.warn('Warning: fetchCandidates received non-array data:', typeof res.data);
      }
      const totalRegisteredEmails = candidates.length;
      const verifiedEmails = candidates.filter(c => c.emailVerified).length;
      setStats(prev => ({
        ...prev,
        totalRegisteredEmails,
        verifiedEmails
      }));
    } catch (err) {
      if (!handleAuthError(err)) {
        console.error('Error loading candidates:', err);
      }
    }
  }, [config, handleAuthError]);

  const fetchStats = useCallback(async () => {
    setLoading(false);
    fetchJobs();
    fetchApplications();
    fetchCandidates();
  }, [fetchJobs, fetchApplications, fetchCandidates]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
        <div className="mb-8">
          <div className="text-xs tracking-[0.35em] uppercase text-theme-dark/60 font-semibold">Admin</div>
          <h1 className="mt-2 text-3xl font-extrabold text-theme-dark mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Admin Panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalJobs}</p>
              </div>
              <div className="bg-theme-blue/10 p-3 rounded-full">
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="mt-4 text-theme-blue hover:text-theme-green text-sm font-semibold transition-colors"
            >
              View All Jobs →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Open Jobs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.openJobs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="mt-4 text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Manage Jobs →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalApplications}</p>
              </div>
              <div className="bg-theme-blue/10 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/candidates')}
              className="mt-4 text-theme-blue hover:text-theme-green text-sm font-semibold transition-colors"
            >
              View Candidates →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApplications}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/candidates')}
              className="mt-4 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Review Now →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Registered Emails</p>
                <p className="text-3xl font-bold text-theme-blue mt-2">{stats.totalRegisteredEmails}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.verifiedEmails} verified</p>
              </div>
              <div className="bg-theme-blue/10 p-3 rounded-full">
                <span className="text-2xl">📧</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/registered-emails')}
              className="mt-4 text-theme-blue hover:text-theme-green text-sm font-semibold transition-colors"
            >
              Manage Emails →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-extrabold text-theme-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/jobs')}
              className="bg-theme-blue text-white px-6 py-3 rounded-lg hover:brightness-95 transition text-left"
            >
              <div className="font-semibold">Manage Job Posts</div>
              <div className="text-sm opacity-90">Add, edit, or delete job positions</div>
            </button>
            <button
              onClick={() => navigate('/admin/candidates')}
              className="bg-theme-blue text-white px-6 py-3 rounded-lg hover:brightness-95 transition text-left"
            >
              <div className="font-semibold">View Candidates</div>
              <div className="text-sm opacity-90">Review all job applications</div>
            </button>
            <button
              onClick={() => navigate('/admin/registered-emails')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition text-left"
            >
              <div className="font-semibold">Registered Emails</div>
              <div className="text-sm opacity-90">View and manage all registered emails</div>
            </button>
            <button
              onClick={fetchStats}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition text-left"
            >
              <div className="font-semibold">Refresh Stats</div>
              <div className="text-sm opacity-90">Update dashboard information</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
