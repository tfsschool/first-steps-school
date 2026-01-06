const rateLimit = require('express-rate-limit');

/**
 * Global API Rate Limiter
 * Limits all API requests per IP
 * Production: 300 requests per 15 minutes (more lenient for legitimate users)
 * Development: 100 requests per 15 minutes
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 300 : 100, // Higher limit in production
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

/**
 * Public Jobs Rate Limiter
 * More lenient for public job listings (30 per 15 minutes)
 * This is a read-only endpoint that should be more accessible
 */
const publicJobsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes
  message: 'Too many requests for job listings. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

module.exports = {
  globalLimiter,
  authLimiter,
  checkAuthLimiter,
  applicationLimiter,
  publicJobsLimiter
};
