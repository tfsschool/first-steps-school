/**
 * API Response Validator Utility
 * Ensures all API responses return consistent data types
 * Prevents runtime errors from unexpected response shapes
 */

/**
 * Validates and normalizes array responses
 * @param {any} data - The data to validate
 * @param {string} context - Context for error logging
 * @returns {Array} - Always returns an array
 */
export const ensureArray = (data, context = 'unknown') => {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[API Validator] Expected array but got ${typeof data} in ${context}`, data);
  }
  return [];
};

/**
 * Validates and normalizes object responses
 * @param {any} data - The data to validate
 * @param {string} context - Context for error logging
 * @returns {Object} - Always returns an object
 */
export const ensureObject = (data, context = 'unknown') => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[API Validator] Expected object but got ${typeof data} in ${context}`, data);
  }
  return {};
};

/**
 * Validates paginated API response
 * @param {any} response - The API response
 * @param {string} context - Context for error logging
 * @returns {Object} - Normalized paginated response
 */
export const validatePaginatedResponse = (response, context = 'unknown') => {
  const data = response?.data || response;
  
  return {
    items: ensureArray(data?.applications || data?.items || data, context),
    totalPages: typeof data?.totalPages === 'number' ? data.totalPages : 1,
    totalItems: typeof data?.totalApplications === 'number' ? data.totalApplications : 
                typeof data?.total === 'number' ? data.total : 0,
    currentPage: typeof data?.currentPage === 'number' ? data.currentPage : 1
  };
};

/**
 * Validates profile data with nested arrays
 * @param {any} profile - The profile data
 * @returns {Object} - Normalized profile with safe arrays
 */
export const validateProfileData = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return null;
  }
  
  return {
    ...profile,
    education: ensureArray(profile.education, 'profile.education'),
    workExperience: ensureArray(profile.workExperience, 'profile.workExperience'),
    skills: ensureArray(profile.skills, 'profile.skills'),
    certifications: ensureArray(profile.certifications, 'profile.certifications')
  };
};

/**
 * Safe API call wrapper with automatic validation
 * @param {Function} apiCall - The API call function
 * @param {Object} options - Validation options
 * @returns {Promise} - Promise with validated data
 */
export const safeApiCall = async (apiCall, options = {}) => {
  const { 
    expectArray = false, 
    expectObject = false,
    expectPaginated = false,
    expectProfile = false,
    context = 'API call',
    fallback = null 
  } = options;
  
  try {
    const response = await apiCall();
    const data = response?.data;
    
    if (expectArray) {
      return ensureArray(data, context);
    }
    
    if (expectObject) {
      return ensureObject(data, context);
    }
    
    if (expectPaginated) {
      return validatePaginatedResponse(response, context);
    }
    
    if (expectProfile) {
      return validateProfileData(data);
    }
    
    return data;
  } catch (error) {
    console.error(`[API Error] ${context}:`, error);
    
    if (fallback !== null) {
      return fallback;
    }
    
    // Return safe defaults based on expected type
    if (expectArray || expectPaginated) {
      return expectPaginated ? { items: [], totalPages: 1, totalItems: 0, currentPage: 1 } : [];
    }
    if (expectObject || expectProfile) {
      return null;
    }
    
    throw error;
  }
};

/**
 * Validates form data arrays before submission
 * @param {Object} formData - Form data with potential arrays
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormArrays = (formData) => {
  return {
    ...formData,
    education: ensureArray(formData.education, 'form.education'),
    workExperience: ensureArray(formData.workExperience, 'form.workExperience'),
    skills: ensureArray(formData.skills, 'form.skills'),
    certifications: ensureArray(formData.certifications, 'form.certifications')
  };
};
