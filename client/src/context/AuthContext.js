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
          // Token added - re-check auth
          setAuthChecked(false);
          checkAuth();
        } else {
          // Token removed - logout
          setIsAuthenticated(false);
          setUserEmail(null);
          setLoading(false);
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
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
      }
    } catch (err) {
      // Handle 401/403 - clear zombie states
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
      }
      // Handle 503 - service unavailable
      else if (err.response?.status === 503) {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
      }
      // Other errors
      else {
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = (token, email) => {
    // Set token in localStorage
    localStorage.setItem('token', token);
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
      // Remove token from localStorage
      localStorage.removeItem('token');
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
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

