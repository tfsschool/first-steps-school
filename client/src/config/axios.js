import axios from 'axios';
import { BASE_URL } from './api';

// Configure axios defaults for all requests
// This ensures HTTP-only cookies are sent with every request
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true; // MANDATORY: Send cookies with all requests for HTTP-only cookie authentication
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor to handle expected errors gracefully
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console errors for 401 on check-auth (expected when not logged in)
    if (error.config?.url?.includes('/check-auth') && error.response?.status === 401) {
      return Promise.reject(error);
    }
    
    // Handle 503 Service Unavailable - don't retry automatically
    if (error.response?.status === 503) {
      return Promise.reject(error);
    }
    
    // For all other errors, let them be handled normally
    return Promise.reject(error);
  }
);

// Export axios (now configured with defaults)
export default axios;

