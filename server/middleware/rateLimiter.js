const rateLimit = require('express-rate-limit');

/**
 * Global API Rate Limiter
 * Limits all API requests to 100 per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: { xForwardedForHeader: false }
});

/**
 * Authentication Rate Limiter
 * Stricter limits for login/register endpoints (5 attempts per hour)
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 auth attempts per hour
  message: 'Too many authentication attempts from this IP, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Check Auth Rate Limiter
 * Lenient limits for check-auth endpoint (100 per 15 minutes)
 * This is called frequently by frontend to verify auth status
 */
const checkAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Same as global limiter
  message: 'Too many authentication checks from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful checks
});

/**
 * Application Submission Rate Limiter
 * Prevents spam on job application endpoint (10 per hour)
 */
const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 applications per hour
  message: 'Too many application submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  globalLimiter,
  authLimiter,
  checkAuthLimiter,
  applicationLimiter
};
