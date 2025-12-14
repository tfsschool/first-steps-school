// API Configuration
// This file centralizes all API endpoints for easy configuration

// Automatically detect the hostname for local development
// This allows the frontend to connect to the backend when accessing via network IP
const getBaseURL = () => {
  // Use environment variable if set (for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In browser environment, detect hostname dynamically
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = '5000';
    
    // Use the same hostname as the frontend (localhost or network IP)
    return `${protocol}//${hostname}:${port}`;
  }
  
  // Fallback for server-side rendering
  return 'http://localhost:5000';
};

const BASE_URL = getBaseURL();
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// Log the API URL in development for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', BASE_URL);
}

export const API_ENDPOINTS = {
  // Public endpoints (no auth required)
  PUBLIC: {
    JOBS: `${BASE_URL}/api/public/jobs`
  },
  
  // Candidate endpoints (authentication-based)
  CANDIDATE: {
    REGISTER: `${BASE_URL}/api/candidate/register`,
    LOGIN: `${BASE_URL}/api/candidate/login`, // Request login link
    VERIFY_LOGIN: (token, email) => `${BASE_URL}/api/candidate/verify-login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    VERIFY_EMAIL: (token, email) => {
      const params = new URLSearchParams({ token: encodeURIComponent(token) });
      if (email) params.append('email', encodeURIComponent(email));
      return `${BASE_URL}/api/candidate/verify-email?${params.toString()}`;
    },
    CHECK_AUTH: `${BASE_URL}/api/candidate/check-auth`, // Check if authenticated
    LOGOUT: `${BASE_URL}/api/candidate/logout`,
    CHECK: (email) => `${BASE_URL}/api/candidate/check/${encodeURIComponent(email)}` // Public check (for registration flow)
  },
  
  // Profile endpoints (authentication required)
  PROFILE: {
    GET: `${BASE_URL}/api/profile`, // No email param - uses authenticated session
    CHECK: `${BASE_URL}/api/profile/check`, // No email param - uses authenticated session
    CREATE_UPDATE: `${BASE_URL}/api/profile`
  },
  
  // Application endpoints (authentication required)
  APPLICATION: {
    CHECK: (jobId) => `${BASE_URL}/api/public/check-application/${jobId}`, // No email param - uses authenticated session
    APPLY: (jobId) => `${BASE_URL}/api/public/apply/${jobId}`
  },
  
  // Admin endpoints
  ADMIN: {
    LOGIN: `${BASE_URL}/api/admin/login`,
    JOBS: `${BASE_URL}/api/admin/jobs`,
    JOB: (id) => id ? `${BASE_URL}/api/admin/job/${id}` : `${BASE_URL}/api/admin/job`,
    APPLICATIONS: `${BASE_URL}/api/admin/applications`, // Get all applications
    APPLICATIONS_BY_JOB: (jobId) => `${BASE_URL}/api/admin/applications/${jobId}`, // Get applications for a specific job
    APPLICATION: (id) => `${BASE_URL}/api/admin/application/${id}`,
    APPLICATION_STATUS: (id) => `${BASE_URL}/api/admin/application/${id}/status`, // Update application status
    DOWNLOAD_CSV: (jobId) => `${BASE_URL}/api/admin/download-csv/${jobId}`, // Download CSV for a job
    DOWNLOAD_CSV_APPLICATION: (applicationId) => `${BASE_URL}/api/admin/download-csv-application/${applicationId}`, // Download CSV for a single application
    STATS: `${BASE_URL}/api/admin/stats`,
    REGISTERED_EMAILS: `${BASE_URL}/api/admin/candidates`, // Get all registered candidates
    DELETE_CANDIDATE: (id) => `${BASE_URL}/api/admin/candidate/${id}` // Delete a candidate
  },
  
  // File uploads (for backward compatibility - Cloudinary URLs are full URLs)
  UPLOADS: {
    BASE: `${BASE_URL}/uploads`
  }
};

export { BASE_URL, FRONTEND_URL };

