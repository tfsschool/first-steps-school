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

// --- ROBUST CORS CONFIGURATION (THE FIX) ---
const allowedOrigins = [
  process.env.FRONTEND_URL,                        // Your Backend Setting
  'https://first-steps-school.vercel.app',         // Your Frontend Project
  'https://first-steps-school-client.vercel.app',  // Alternate Frontend Link
  'http://localhost:3000',                         // Localhost Frontend
  'http://localhost:5000'                          // Localhost Backend
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like direct browser visits, Postman, or mobile apps)
    if (!origin) return callback(null, true);

    // 2. Check if the origin is explicitly in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // 3. Dynamic Check: Allow ANY Vercel deployment (Crucial for Vercel previews)
    if (origin.endsWith('.vercel.app')) {
       return callback(null, true);
    }

    // 4. Local Development: Allow local network IPs (e.g., 192.168.x.x)
    if (process.env.NODE_ENV !== 'production' && origin.includes('192.168.')) {
        return callback(null, true);
    }

    // 5. Block everything else
    console.log(`❌ CORS: Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// --- RATE LIMITERS ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts from this IP, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

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