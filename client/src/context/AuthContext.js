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
  // Initialize auth state from localStorage token only (optimistic UI)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || null;
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status ONCE on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token added in another tab - Login
          setAuthChecked(false);
          checkAuth();
        } else {
          // Token removed in another tab - Logout
          setIsAuthenticated(false);
          setUserEmail(null);
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setUserEmail(null);
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get(API_ENDPOINTS.CANDIDATE.CHECK_AUTH, config);
      
      if (res.data.authenticated) {
        setIsAuthenticated(true);
        setUserEmail(res.data.email);
        localStorage.setItem('userEmail', res.data.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
    } catch (err) {
      // Only clear auth on 401 (Unauthorized) or 403 (Forbidden)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
      // For 500s or Network Errors, KEEP the user logged in (Optimistic)
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setIsAuthenticated(true);
    setUserEmail(email);
    setAuthChecked(true);
  };


  const logout = async () => {
    try {
      // Cookies are automatically sent via withCredentials in axios config
      await axios.post(API_ENDPOINTS.CANDIDATE.LOGOUT, {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove token and email from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      // Update state
      setIsAuthenticated(false);
      setUserEmail(null);
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    loading,
    authChecked,
    checkAuth,
    login,
    logout,
    setAuthenticated: (auth, email) => {
      setIsAuthenticated(auth);
      setUserEmail(email);
      if (email) {
        localStorage.setItem('userEmail', email);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

