import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists in localStorage (admin still uses token-based auth)
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Verify token is still valid by making a test request
    // Note: Admin routes still use token-based auth, not cookies
    const verifyToken = async () => {
      try {
        // Try to access a protected admin endpoint to verify token
        await axios.get(API_ENDPOINTS.ADMIN.STATS, {
          headers: { 'x-auth-token': token }
        });
        setIsAuthenticated(true);
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default PrivateRoute;