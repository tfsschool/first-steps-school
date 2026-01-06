import axios from 'axios';
import { BASE_URL } from './api';
import { responseValidationInterceptor, errorValidationInterceptor } from '../utils/apiResponseValidator';

// Configure axios defaults for all requests
// This ensures HTTP-only cookies are sent with every request
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true; // MANDATORY: Send cookies with all requests for HTTP-only cookie authentication
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Response interceptor to validate JSON responses (not HTML)
axios.interceptors.response.use(
  (response) => {
    // Validate that response is JSON, not HTML
    return responseValidationInterceptor(response);
  },
  (error) => {
    // Suppress console errors for 401 on check-auth (expected when not logged in)
    if (error.config?.url?.includes('/check-auth') && error.response?.status === 401) {
      return Promise.reject(error);
    }
    
    // Handle 429 Rate Limit - add retry-after info to error
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.headers['ratelimit-reset'];
      if (retryAfter) {
        error.retryAfter = parseInt(retryAfter);
      }
      console.warn('Rate limit exceeded. Retry after:', retryAfter, 'seconds');
      return Promise.reject(error);
    }
    
    // Handle 503 Service Unavailable - don't retry automatically
    if (error.response?.status === 503) {
      return Promise.reject(error);
    }
    
    // Validate error responses (check for HTML error pages)
    return errorValidationInterceptor(error);
  }
);

// Export axios (now configured with defaults)
export default axios;

