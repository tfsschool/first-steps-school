import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from localStorage and include in headers
      const token = localStorage.getItem('token');
      const config = token ? { headers: { 'x-auth-token': token } } : {};
      // Use relative path since baseURL is set in axios config
      const res = await axios.get(API_ENDPOINTS.CANDIDATE.CHECK_AUTH, config);
      
      if (res.data.authenticated) {
        setIsAuthenticated(true);
        setUserEmail(res.data.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    } catch (err) {
      // 401 Unauthorized is expected when user is not logged in - not an error
      // Only log actual errors (network errors, 500 errors, etc.)
      if (err.response?.status === 401) {
        // User is not authenticated - this is normal, not an error
        setIsAuthenticated(false);
        setUserEmail(null);
      } else {
        // Actual error (network, server error, etc.)
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Cookies are automatically sent via withCredentials in axios config
      await axios.post(API_ENDPOINTS.CANDIDATE.LOGOUT, {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUserEmail(null);
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    loading,
    checkAuth,
    logout,
    setAuthenticated: (auth, email) => {
      setIsAuthenticated(auth);
      setUserEmail(email);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

