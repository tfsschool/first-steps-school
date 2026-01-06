const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Middleware to ensure database connection is established
 * Attempts to connect if not already connected (serverless-friendly)
 */
const checkDatabaseConnection = async (req, res, next) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // If connecting, wait briefly
    if (mongoose.connection.readyState === 2) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏳ Database connection in progress, waiting...');
      }
      // Wait up to 5 seconds for connection
      const timeout = 5000;
      const startTime = Date.now();
      while (mongoose.connection.readyState === 2 && Date.now() - startTime < timeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (mongoose.connection.readyState === 1) {
        return next();
      }
    }

    // Not connected - attempt to connect
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Database not connected, attempting to connect...');
    }
    await connectDB();
    
    // Verify connection succeeded
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Connection failed
    throw new Error('Failed to establish database connection');
  } catch (err) {
    console.error('❌ Database connection check failed:', err.message);
    console.error('Connection state:', mongoose.connection.readyState);
    console.error('Error details:', err);
    return res.status(503).json({
      msg: 'Database connection unavailable. This is usually temporary - please wait a moment and try again. If the issue persists, contact support.',
      error: 'DATABASE_UNAVAILABLE',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { checkDatabaseConnection };
