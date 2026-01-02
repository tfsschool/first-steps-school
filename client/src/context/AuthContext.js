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
    // Skip auth check on login-verify and verify-email pages
    // These pages handle their own authentication flow
    const currentPath = window.location.pathname;
    if (currentPath === '/login-verify' || currentPath === '/verify-email') {
      console.log('[AuthContext] Skipping checkAuth on verification page:', currentPath);
      setLoading(false);
      setAuthChecked(true);
      return;
    }

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
          // Token added - set authenticated IMMEDIATELY (optimistic update)
          setIsAuthenticated(true);
          const storedEmail = localStorage.getItem('userEmail');
          if (storedEmail) {
            setUserEmail(storedEmail);
          }
          // Then revalidate with backend in background
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
    console.log('[AuthContext] checkAuth called, token exists:', !!token);
    
    // If no token, immediately set unauthenticated
    if (!token) {
      console.log('[AuthContext] No token found, setting unauthenticated');
      setIsAuthenticated(false);
      setUserEmail(null);
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    try {
      const config = { headers: { 'x-auth-token': token } };
      console.log('[AuthContext] Calling check-auth endpoint');
      const res = await axios.get(API_ENDPOINTS.CANDIDATE.CHECK_AUTH, config);
      console.log('[AuthContext] check-auth response:', res.data);
      
      if (res.data.authenticated) {
        console.log('[AuthContext] User authenticated:', res.data.email);
        setIsAuthenticated(true);
        setUserEmail(res.data.email);
        // Persist email to localStorage
        localStorage.setItem('userEmail', res.data.email);
      } else {
        console.log('[AuthContext] User not authenticated');
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
    } catch (err) {
      console.error('[AuthContext] checkAuth error:', err.response?.status, err.message);
      // ONLY clear auth on explicit 401/403 (invalid/expired token)
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('[AuthContext] Invalid token (401/403), clearing auth');
        setIsAuthenticated(false);
        setUserEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
      // For ALL other errors (500, 503, network errors) - keep user logged in (optimistic)
      else {
        console.log('[AuthContext] Server/network error (status:', err.response?.status, '), keeping token and staying logged in');
        // Keep isAuthenticated as true (optimistic) - don't logout on temporary issues
        // The token is still in localStorage and will be retried on next checkAuth
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = (token, email) => {
    console.log('[AuthContext] login() called with email:', email);
    // Set token and email in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    console.log('[AuthContext] Token and email stored in localStorage');
    // Update state
    setIsAuthenticated(true);
    setUserEmail(email);
    setLoading(false);
    setAuthChecked(true);
    console.log('[AuthContext] Auth state updated: authenticated=true');
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

