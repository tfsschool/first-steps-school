/**
 * API Response Validator
 * Validates API responses to ensure they are JSON and not HTML
 * Prevents runtime errors from unexpected response types
 */

/**
 * Check if response is HTML instead of JSON
 * @param {any} data - Response data to check
 * @returns {boolean} - True if data appears to be HTML
 */
export const isHTMLResponse = (data) => {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed.startsWith('<!DOCTYPE') || 
           trimmed.startsWith('<html') || 
           trimmed.startsWith('<HTML');
  }
  return false;
};

/**
 * Validate that API response is valid JSON, not HTML
 * @param {any} response - Axios response object
 * @param {string} endpoint - Endpoint name for logging
 * @returns {any} - Validated response data
 * @throws {Error} - If response is HTML or invalid
 */
export const validateJSONResponse = (response, endpoint = 'API') => {
  const data = response?.data;
  
  // Check if response is HTML
  if (isHTMLResponse(data)) {
    console.error(`❌ [${endpoint}] Received HTML instead of JSON:`, data.substring(0, 200));
    throw new Error(`API returned HTML instead of JSON. This usually means the API route is not properly configured.`);
  }
  
  // Check if response is a string (should be parsed JSON)
  if (typeof data === 'string' && data.trim().length > 0) {
    try {
      // Try to parse if it's a JSON string
      return JSON.parse(data);
    } catch (e) {
      console.error(`❌ [${endpoint}] Received non-JSON string:`, data.substring(0, 200));
      throw new Error(`API returned invalid data format`);
    }
  }
  
  return data;
};

/**
 * Validate array response from API
 * @param {any} response - Axios response object
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Array} - Validated array
 */
export const validateArrayResponse = (response, endpoint = 'API') => {
  const data = validateJSONResponse(response, endpoint);
  
  if (!Array.isArray(data)) {
    console.warn(`⚠️ [${endpoint}] Expected array but got ${typeof data}. Returning empty array.`);
    return [];
  }
  
  return data;
};

/**
 * Validate object response from API
 * @param {any} response - Axios response object
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} - Validated object
 */
export const validateObjectResponse = (response, endpoint = 'API') => {
  const data = validateJSONResponse(response, endpoint);
  
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn(`⚠️ [${endpoint}] Expected object but got ${typeof data}. Returning empty object.`);
    return {};
  }
  
  return data;
};

/**
 * Validate paginated response from API
 * @param {any} response - Axios response object
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} - Normalized paginated response
 */
export const validatePaginatedResponse = (response, endpoint = 'API') => {
  const data = validateJSONResponse(response, endpoint);
  
  if (!data || typeof data !== 'object') {
    console.warn(`⚠️ [${endpoint}] Invalid paginated response. Returning default structure.`);
    return {
      applications: [],
      totalApplications: 0,
      totalPages: 1,
      currentPage: 1
    };
  }
  
  return {
    applications: Array.isArray(data.applications) ? data.applications : [],
    totalApplications: typeof data.totalApplications === 'number' ? data.totalApplications : 0,
    totalPages: typeof data.totalPages === 'number' ? data.totalPages : 1,
    currentPage: typeof data.currentPage === 'number' ? data.currentPage : 1
  };
};

/**
 * Axios interceptor to validate all responses
 * Add this to axios instance in axios.js
 */
export const responseValidationInterceptor = (response) => {
  const endpoint = response.config?.url || 'Unknown';
  
  // Check for HTML responses
  if (isHTMLResponse(response.data)) {
    console.error(`❌ API Error: ${endpoint} returned HTML instead of JSON`);
    console.error('This indicates a routing problem - API requests are being handled by frontend routing');
    
    return Promise.reject(new Error(
      `API routing error: ${endpoint} returned HTML. Check Vercel configuration.`
    ));
  }
  
  return response;
};

/**
 * Error interceptor to handle HTML error pages
 */
export const errorValidationInterceptor = (error) => {
  if (error.response) {
    const endpoint = error.config?.url || 'Unknown';
    const data = error.response.data;
    
    // Check if error response is HTML
    if (isHTMLResponse(data)) {
      console.error(`❌ API Error Response: ${endpoint} returned HTML error page`);
      console.error('Status:', error.response.status);
      
      return Promise.reject(new Error(
        `API routing error: ${endpoint} returned HTML error page (${error.response.status})`
      ));
    }
  }
  
  return Promise.reject(error);
};

/**
 * Safe API call wrapper with automatic validation
 * @param {Function} apiCall - The API call function
 * @param {Object} options - Validation options
 * @returns {Promise} - Promise with validated data
 */
export const safeAPICall = async (apiCall, options = {}) => {
  const {
    expectArray = false,
    expectObject = false,
    expectPaginated = false,
    endpoint = 'API',
    fallback = null
  } = options;
  
  try {
    const response = await apiCall();
    
    if (expectArray) {
      return validateArrayResponse(response, endpoint);
    }
    
    if (expectObject) {
      return validateObjectResponse(response, endpoint);
    }
    
    if (expectPaginated) {
      return validatePaginatedResponse(response, endpoint);
    }
    
    return validateJSONResponse(response, endpoint);
  } catch (error) {
    console.error(`❌ [${endpoint}] API call failed:`, error.message);
    
    if (fallback !== null) {
      console.warn(`⚠️ [${endpoint}] Using fallback value`);
      return fallback;
    }
    
    // Return safe defaults based on expected type
    if (expectArray) return [];
    if (expectPaginated) return {
      applications: [],
      totalApplications: 0,
      totalPages: 1,
      currentPage: 1
    };
    if (expectObject) return {};
    
    throw error;
  }
};
