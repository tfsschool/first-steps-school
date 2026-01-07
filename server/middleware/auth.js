const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');

// Middleware to verify JWT token from header (primary) or HTTP-only cookie (fallback)
const authenticate = async (req, res, next) => {
  try {
    // Get token from header first (for cross-site compatibility), then fallback to cookie
    let token = req.header('x-auth-token');
    if (!token) {
      token = req.cookies?.authToken;
    }

    if (!token) {
      return res.status(401).json({ 
        msg: 'Authentication required. Please login.',
        authenticated: false 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'JsonWebTokenError' || jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          msg: 'Session expired. Please login again.',
          authenticated: false,
          expired: true 
        });
      }
      throw jwtErr;
    }
    
    // Check if candidate exists and is verified (use lean() for performance)
    let candidate;
    try {
      // Add timeout to prevent hanging on slow database queries
      candidate = await Candidate.findById(decoded.candidateId)
        .lean()
        .maxTimeMS(10000); // 10 second query timeout
    } catch (dbErr) {
      console.error('Database error in auth middleware:', {
        error: dbErr.message,
        candidateId: decoded.candidateId,
        readyState: require('mongoose').connection.readyState,
        errorName: dbErr.name
      });
      
      // Provide more specific error message
      const errorMsg = dbErr.name === 'MongooseError' && dbErr.message.includes('buffering timed out')
        ? 'Database connection is slow. Please check your internet connection and try again.'
        : 'Service temporarily unavailable. Please try again in a moment.';
      
      return res.status(503).json({ 
        msg: errorMsg,
        authenticated: false,
        details: process.env.NODE_ENV === 'development' ? dbErr.message : undefined
      });
    }
    
    if (!candidate) {
      return res.status(401).json({ 
        msg: 'Invalid authentication. Please login again.',
        authenticated: false 
      });
    }

    if (!candidate.emailVerified) {
      return res.status(403).json({ 
        msg: 'Email not verified. Please verify your email first.',
        authenticated: false,
        notVerified: true 
      });
    }

    // Attach candidate info to request
    req.candidate = {
      id: candidate._id,
      email: candidate.email,
      emailVerified: candidate.emailVerified
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      msg: 'Authentication error',
      authenticated: false 
    });
  }
};

// Middleware to check if user is authenticated (optional - doesn't fail if not authenticated)
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header first (for cross-site compatibility), then fallback to cookie
    let token = req.header('x-auth-token');
    if (!token) {
      token = req.cookies?.authToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const candidate = await Candidate.findById(decoded.candidateId).lean();
        
        if (candidate && candidate.emailVerified) {
          req.candidate = {
            id: candidate._id,
            email: candidate.email,
            emailVerified: candidate.emailVerified
          };
        }
      } catch (err) {
        // Continue without authentication if token is invalid or DB error
      }
    }

    next();
  } catch (err) {
    // Continue without authentication if any error occurs
    next();
  }
};

module.exports = { authenticate, optionalAuth };
