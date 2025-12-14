import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">First Steps School</p>
      </div>

      <nav className="flex-1 p-4">
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
          to="/admin/candidates"
          className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/candidates')}`}
        >
          👥 Candidates
        </Link>
        <Link
          to="/admin/registered-emails"
          className={`block px-4 py-3 rounded-lg mb-2 transition ${isActive('/admin/registered-emails')}`}
        >
          📧 Registered Emails
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

