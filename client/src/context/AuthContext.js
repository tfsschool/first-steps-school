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
    if (!authChecked) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        // Token changed in another tab
        if (e.newValue) {
          // Token added - revalidate with backend
          setAuthChecked(false);
          checkAuth();
        } else {
          // Token removed - logout immediately
          setIsAuthenticated(false);
          setUserEmail(null);
          setLoading(false);
          setAuthChecked(true);
          // Clear all auth-related localStorage
          localStorage.removeItem('userEmail');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuth = async () => {
    // Always read token from localStorage at start
    const token = localStorage.getItem('token');
    
    // If no token, immediately set unauthenticated
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
        // Persist email to localStorage
        localStorage.setItem('userEmail', res.data.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
    } catch (err) {
      // Handle 401/403 - clear zombie states (invalid/expired token)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
      // Handle 503 - service unavailable (keep token, might be temporary)
      else if (err.response?.status === 503) {
        setIsAuthenticated(false);
        setUserEmail(null);
        // Don't remove token - service might come back
      }
      // Network errors or other issues - keep token, might be temporary
      else {
        setIsAuthenticated(false);
        setUserEmail(null);
        // Don't remove token on network errors - keep it for retry
        console.error('Auth check failed (network/server error):', err.message);
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = (token, email) => {
    // Set token and email in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    // Update state
    setIsAuthenticated(true);
    setUserEmail(email);
    setLoading(false);
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

