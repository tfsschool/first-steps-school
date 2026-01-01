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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if candidate exists and is verified
    const candidate = await Candidate.findById(decoded.candidateId);
    
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
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        msg: 'Session expired. Please login again.',
        authenticated: false,
        expired: true 
      });
    }
    
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const candidate = await Candidate.findById(decoded.candidateId);
      
      if (candidate && candidate.emailVerified) {
        req.candidate = {
          id: candidate._id,
          email: candidate.email,
          emailVerified: candidate.emailVerified
        };
      }
    }

    next();
  } catch (err) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = { authenticate, optionalAuth };
