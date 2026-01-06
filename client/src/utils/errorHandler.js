/**
 * Extract detailed error message from axios error response
 * @param {Error} err - The error object from axios
 * @param {string} defaultMsg - Default message if no specific error found
 * @returns {string} - Formatted error message
 */
export const getErrorMessage = (err, defaultMsg = 'An error occurred') => {
  if (!err) return defaultMsg;

  // Check for validation errors array
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    return err.response.data.errors.map(e => e.msg || e).join('\n');
  }

  // Check for single error message
  if (err.response?.data?.msg) {
    return err.response.data.msg;
  }

  // Check for alternative error field
  if (err.response?.data?.error) {
    return err.response.data.error;
  }

  // Check for error message in response data
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  // Check for axios error message
  if (err.message) {
    return err.message;
  }

  return defaultMsg;
};

/**
 * Get formatted error message with prefix
 * @param {Error} err - The error object
 * @param {string} prefix - Prefix for the error message
 * @returns {string} - Formatted error message with prefix
 */
export const getFormattedError = (err, prefix = 'Error') => {
  const errorMsg = getErrorMessage(err);
  return `${prefix}: ${errorMsg}`;
};

/**
 * Check if error is a specific HTTP status code
 * @param {Error} err - The error object
 * @param {number} statusCode - HTTP status code to check
 * @returns {boolean}
 */
export const isErrorStatus = (err, statusCode) => {
  return err?.response?.status === statusCode;
};

/**
 * Check if error is authentication related (401 or 403)
 * @param {Error} err - The error object
 * @returns {boolean}
 */
export const isAuthError = (err) => {
  return isErrorStatus(err, 401) || isErrorStatus(err, 403);
};

/**
 * Check if error is rate limit error (429)
 * @param {Error} err - The error object
 * @returns {boolean}
 */
export const isRateLimitError = (err) => {
  return isErrorStatus(err, 429);
};

/**
 * Get retry after time from rate limit error
 * @param {Error} err - The error object
 * @returns {number} - Retry after time in seconds, or null if not available
 */
export const getRetryAfter = (err) => {
  if (!isRateLimitError(err)) return null;
  
  const retryAfter = err.response?.data?.retryAfter || 
                     err.response?.headers['retry-after'] || 
                     err.response?.headers['ratelimit-reset'];
  
  return retryAfter ? parseInt(retryAfter) : null;
};

/**
 * Check if error is service unavailable (503)
 * @param {Error} err - The error object
 * @returns {boolean}
 */
export const isServiceUnavailable = (err) => {
  return isErrorStatus(err, 503);
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      // Don't retry on client errors (4xx except 429) or auth errors
      if (err.response?.status >= 400 && err.response?.status < 500 && err.response?.status !== 429) {
        throw err;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw err;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
