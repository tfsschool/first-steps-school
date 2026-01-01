require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const connectDB = require('./config/db');
const { globalLimiter, authLimiter, applicationLimiter } = require('./middleware/rateLimiter');
const { checkDatabaseConnection } = require('./middleware/dbCheck');

const app = express();
app.set('trust proxy', 1);

// Connect Database (await for Vercel cold starts)
(async () => {
  await connectDB();
})();

// Security Middleware
app.use(helmet());
app.use(compression());

// --- EXPRESS 5 COMPATIBILITY PATCH ---
// (Keeps req.query writable for security plugins)
app.use((req, res, next) => {
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

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// --- ROBUST CORS CONFIGURATION ---
const allowedOrigins = [
  'https://www.tfs.school',
  'https://tfs.school',
  'https://first-steps-school.vercel.app', // Fallback for testing
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like direct browser visits, Postman, or mobile apps)
    if (!origin) return callback(null, true);

    // Normalize origin to prevent mismatches (e.g., trailing slash, casing)
    const normalizedOrigin = String(origin).trim().replace(/\/+$/, '').toLowerCase();

    // 2. Check if the origin is explicitly in our allowed list
    if (allowedOrigins.map((o) => String(o).trim().replace(/\/+$/, '').toLowerCase()).indexOf(normalizedOrigin) !== -1) {
      return callback(null, true);
    }

    // 3. Dynamic Check: Allow ANY Vercel deployment (Crucial for Vercel previews)
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Local Development: Allow localhost and local network IPs
    if (process.env.NODE_ENV !== 'production') {
      // Allow localhost with any port
      if (normalizedOrigin.startsWith('http://localhost:') || normalizedOrigin.startsWith('https://localhost:')) {
        return callback(null, true);
      }
      // Allow local network IPs (e.g., 192.168.x.x)
      if (normalizedOrigin.includes('192.168.') || normalizedOrigin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // 5. Block everything else
    console.log(`❌ CORS: Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // REQUIRED: Allows cookies to be sent cross-site
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow all HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Headers that can be sent
  exposedHeaders: ['Set-Cookie'], // Headers that frontend can access
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false, // Pass preflight response to next handler
  maxAge: 86400 // Cache preflight response for 24 hours
}));
app.use(express.json());
app.use(cookieParser());

// --- RATE LIMITERS ---
app.use('/api', globalLimiter);

// --- DATABASE HEALTH CHECK ---
// Apply to all API routes to gracefully handle DB unavailability
app.use('/api', checkDatabaseConnection);

// --- ROUTES ---

// 1. Simple Home Route (To verify API is running without crashing)
app.get('/', (req, res) => {
  res.send('API is Running Successfully!');
});

// 2. API Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/candidate/login', authLimiter);
app.use('/api/candidate/register', authLimiter);
app.use('/api/candidate', require('./routes/candidateRoutes'));

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
// This must be at the very end, before app.listen/module.exports
app.use((err, req, res, next) => {
  console.error("🔥 SERVER CRASH:", err.stack); // This will show in Vercel logs
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// --- SERVER STARTUP (VERCEL COMPATIBLE) ---
const PORT = process.env.PORT || 5000;

// Only listen to the port if running LOCALLY (Not on Vercel)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless Functions
module.exports = app;