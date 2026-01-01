const mongoose = require('mongoose');

/**
 * Middleware to check database connection health
 * Returns 503 if database is unavailable instead of crashing
 */
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('⚠️ Database not connected. ReadyState:', mongoose.connection.readyState);
    return res.status(503).json({
      msg: 'Service temporarily unavailable. Database connection is not ready.',
      error: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
};

module.exports = { checkDatabaseConnection };
