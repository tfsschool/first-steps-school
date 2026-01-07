import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    // Clear all admin-specific localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-theme-blue text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-theme-dark text-white z-50 border-b border-white/10">
        <div className="h-full px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition grid place-items-center"
            aria-label="Open admin menu"
          >
            <span className="text-2xl leading-none">≡</span>
          </button>
          <div className="font-bold">Admin Panel</div>
          <div className="w-10" />
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div
        className={`bg-theme-dark text-white w-64 min-h-screen fixed left-0 top-0 flex flex-col z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:transform-none`}
      >
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">The First Steps School</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden h-10 w-10 rounded-lg hover:bg-white/10 transition grid place-items-center"
            aria-label="Close admin menu"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <nav className="flex-1 p-4" onClick={() => setMobileOpen(false)}>
          <Link
            to="/admin/dashboard"
            className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/dashboard')}`}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/jobs"
            className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/jobs')}`}
          >
            💼 Job Posts
          </Link>
          <Link
            to="/admin/view-candidates"
            className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/view-candidates')}`}
          >
            👥 Candidates
          </Link>
          <Link
            to="/admin/candidates"
            className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/candidates')}`}
          >
            📋 Applications
          </Link>
          <Link
            to="/admin/registered-emails"
            className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/registered-emails')}`}
          >
            📧 Registered Emails
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:brightness-95 text-white px-4 py-2 rounded-lg transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

