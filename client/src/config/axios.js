import axios from 'axios';
import { BASE_URL } from './api';

// Configure axios defaults for all requests
// This ensures HTTP-only cookies are sent with every request
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true; // MANDATORY: Send cookies with all requests for HTTP-only cookie authentication
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor to suppress console errors for expected 401 responses on check-auth endpoint
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console errors for 401 on check-auth (expected when not logged in)
    if (error.config?.url?.includes('/check-auth') && error.response?.status === 401) {
      // Return a rejected promise but don't log it as an error
      return Promise.reject(error);
    }
    // For all other errors, let them be handled normally
    return Promise.reject(error);
  }
);

// Export axios (now configured with defaults)
export default axios;

