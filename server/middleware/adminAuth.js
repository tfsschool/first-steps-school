const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify admin JWT token from header
const adminAuth = async (req, res, next) => {
  try {
    // Get token from x-auth-token header (primary) or Authorization header (fallback)
    let token = req.header('x-auth-token');
    
    // If not found in x-auth-token, try Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader) {
        // Extract token from "Bearer <token>" or use as-is
        token = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : authHeader;
      }
    }

    if (!token) {
      return res.status(401).json({ 
        msg: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists
    const admin = await Admin.findById(decoded.admin?.id);
    
    if (!admin) {
      return res.status(401).json({ 
        msg: 'Token is not valid' 
      });
    }

    // Attach admin info to request
    req.admin = {
      id: admin._id,
      username: admin.username
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        msg: 'Token is not valid' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        msg: 'Token has expired' 
      });
    }
    
    console.error('Admin auth middleware error:', err);
    return res.status(500).json({ 
      msg: 'Server Error' 
    });
  }
};

module.exports = adminAuth;

