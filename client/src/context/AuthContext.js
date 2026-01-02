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
  // Initialize state from localStorage for persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || null;
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(() => {
    const cached = localStorage.getItem('hasProfile');
    return cached === 'true';
  });
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const cached = localStorage.getItem('appliedJobs');
    return cached ? JSON.parse(cached) : [];
  });

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
          const email = localStorage.getItem('userEmail');
          setIsAuthenticated(true);
          setUserEmail(email);
          setAuthChecked(false);
          checkAuth();
        } else {
          // Token removed - logout
          setIsAuthenticated(false);
          setUserEmail(null);
          setHasProfile(false);
          setAppliedJobs([]);
          setLoading(false);
          // Clear all auth-related localStorage
          localStorage.removeItem('userEmail');
          localStorage.removeItem('hasProfile');
          localStorage.removeItem('appliedJobs');
          localStorage.removeItem('profileName');
          localStorage.removeItem('isProfileLocked');
        }
      } else if (e.key === 'hasProfile') {
        // Profile state changed in another tab
        setHasProfile(e.newValue === 'true');
      } else if (e.key === 'appliedJobs') {
        // Applied jobs changed in another tab
        setAppliedJobs(e.newValue ? JSON.parse(e.newValue) : []);
      } else if (e.key === 'userEmail') {
        // Email changed in another tab
        setUserEmail(e.newValue);
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
        localStorage.removeItem('hasProfile');
        localStorage.removeItem('appliedJobs');
        localStorage.removeItem('profileName');
        localStorage.removeItem('isProfileLocked');
      }
    } catch (err) {
      // Handle 401/403 - clear zombie states (invalid/expired token)
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setUserEmail(null);
        setHasProfile(false);
        setAppliedJobs([]);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('hasProfile');
        localStorage.removeItem('appliedJobs');
        localStorage.removeItem('profileName');
        localStorage.removeItem('isProfileLocked');
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

  const updateProfileState = (profileExists, profileData = {}) => {
    setHasProfile(profileExists);
    localStorage.setItem('hasProfile', profileExists.toString());
    if (profileData.fullName) {
      localStorage.setItem('profileName', profileData.fullName);
    }
    if (profileData.isLocked !== undefined) {
      localStorage.setItem('isProfileLocked', profileData.isLocked.toString());
    }
  };

  const updateAppliedJobs = (jobIds) => {
    const jobArray = Array.isArray(jobIds) ? jobIds : Array.from(jobIds);
    setAppliedJobs(jobArray);
    localStorage.setItem('appliedJobs', JSON.stringify(jobArray));
  };

  const logout = async () => {
    try {
      // Cookies are automatically sent via withCredentials in axios config
      await axios.post(API_ENDPOINTS.CANDIDATE.LOGOUT, {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('hasProfile');
      localStorage.removeItem('appliedJobs');
      localStorage.removeItem('profileName');
      localStorage.removeItem('isProfileLocked');
      // Update state
      setIsAuthenticated(false);
      setUserEmail(null);
      setHasProfile(false);
      setAppliedJobs([]);
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    loading,
    authChecked,
    hasProfile,
    appliedJobs,
    checkAuth,
    login,
    logout,
    updateProfileState,
    updateAppliedJobs,
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

