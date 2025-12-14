/**
 * ============================================================================
 * TROUBLESHOOTING CHECKLIST - If you're experiencing connection issues:
 * ============================================================================
 * 
 * 1. ✅ Is the backend running?
 *    → Run: npm start (or npm run dev)
 *    → Check console for: "Server started on port 5000"
 * 
 * 2. ✅ Is Windows Firewall allowing Node.js?
 *    → Open Windows Defender Firewall
 *    → Click "Allow an app or feature through Windows Firewall"
 *    → Find "Node.js" and check both "Private" and "Public" networks
 *    → If not listed, click "Allow another app" and add Node.js
 * 
 * 3. ✅ Is the IP address matching?
 *    → Backend shows: "Access from network: http://192.168.x.x:5000"
 *    → Frontend should use the SAME IP address
 *    → Check browser console for the actual API URL being used
 * 
 * 4. ✅ Are you accessing from the same network?
 *    → Both devices must be on the same WiFi/LAN network
 *    → Try accessing backend directly: http://192.168.x.x:5000/api/public/jobs
 * 
 * 5. ✅ CORS Configuration
 *    → This server allows: localhost, 127.0.0.1, and all 192.168.x.x IPs in development
 *    → Check server console for CORS errors
 * 
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Security Middleware
// Helmet for secure HTTP headers
app.use(helmet());

// Compression middleware for response compression
app.use(compression());

// Fix for Express 5 compatibility: Make req.query writable for express-mongo-sanitize
// Express 5 made req.query read-only, but express-mongo-sanitize needs to modify it
app.use((req, res, next) => {
  // Make req.query writable for express-mongo-sanitize compatibility
  if (req.query && typeof req.query === 'object') {
    Object.defineProperty(req, 'query', {
      ...Object.getOwnPropertyDescriptor(req, 'query'),
      value: { ...req.query },
      writable: true,
      configurable: true
    });
  }
  next();
});

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Global Rate Limiter - 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Stricter Auth Rate Limiter - 5 requests per hour for login/register
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration - allow requests from frontend URL and local network
// For local testing, allows both localhost and local IP address
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

// Add local IP if provided
if (process.env.LOCAL_IP) {
  allowedOrigins.push(`http://${process.env.LOCAL_IP}:3000`);
}

const corsOptions = {
  origin: function (origin, callback) {
    // In production, prioritize FRONTEND_URL
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      if (!origin || origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // DEVELOPMENT MODE: Allow any localhost or local network IP
      // This is more permissive for local network development
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isLocalNetwork = 
        origin.startsWith('http://192.168.') || 
        origin.startsWith('http://10.0.') || 
        origin.startsWith('http://172.16.') ||
        origin.startsWith('http://172.17.') ||
        origin.startsWith('http://172.18.') ||
        origin.startsWith('http://172.19.') ||
        origin.startsWith('http://172.20.') ||
        origin.startsWith('http://172.21.') ||
        origin.startsWith('http://172.22.') ||
        origin.startsWith('http://172.23.') ||
        origin.startsWith('http://172.24.') ||
        origin.startsWith('http://172.25.') ||
        origin.startsWith('http://172.26.') ||
        origin.startsWith('http://172.27.') ||
        origin.startsWith('http://172.28.') ||
        origin.startsWith('http://172.29.') ||
        origin.startsWith('http://172.30.') ||
        origin.startsWith('http://172.31.');
      
      // In development, allow all localhost and local network IPs
      if (process.env.NODE_ENV !== 'production' && (isLocalhost || isLocalNetwork)) {
        console.log(`✅ CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS: Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Parse HTTP-only cookies


// Define Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
// Apply auth rate limiter to login and register routes
app.use('/api/candidate/login', authLimiter);
app.use('/api/candidate/register', authLimiter);
app.use('/api/candidate', require('./routes/candidateRoutes'));

const PORT = process.env.PORT || 5000;

// Only listen if NOT running on Vercel (i.e., running locally)
// Vercel will handle the serverless function invocation
if (require.main === module) {
  // Listen on all network interfaces (0.0.0.0) to allow access from other devices
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Access from this device: http://localhost:${PORT}`);
    // Get the actual IP address dynamically
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    for (const interfaceName in networkInterfaces) {
      for (const iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
          localIP = iface.address;
          break;
        }
      }
      if (localIP !== 'localhost') break;
    }
    console.log(`Access from network: http://${localIP}:${PORT}`);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;