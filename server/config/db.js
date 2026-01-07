const mongoose = require('mongoose');

/**
 * Cached connection promise for serverless environments
 * This prevents creating multiple connections in serverless functions
 */
let cachedConnection = null;

/**
 * Check if database is connected
 * Uses mongoose.connection.readyState as source of truth
 */
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

/**
 * Connect to MongoDB with proper serverless handling
 * Returns a promise that resolves when connected
 */
const connectDB = async () => {
    // Validate environment variable first
    if (!process.env.MONGO_URI) {
        const error = new Error('MONGO_URI is not defined in environment variables');
        console.error('❌ CRITICAL:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.log('Please set MONGO_URI in your .env file or environment variables');
        }
        throw error;
    }

    // If already connected, return immediately
    if (isConnected()) {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Using existing MongoDB connection (readyState: 1)');
        }
        return mongoose.connection;
    }

    // If connection is in progress, wait for it
    if (cachedConnection) {
        if (process.env.NODE_ENV === 'development') {
            console.log('⏳ Waiting for existing connection attempt...');
        }
        return cachedConnection;
    }

    // Create new connection promise and cache it
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Establishing new MongoDB connection...');
    }
    cachedConnection = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000, // Increased to 30s for slower connections
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 75000, // Increased to 75s
        family: 4,
        // Serverless-friendly options
        maxIdleTimeMS: 10000,
        retryWrites: true,
        retryReads: true,
        connectTimeoutMS: 30000, // Increased to 30s
        heartbeatFrequencyMS: 10000, // Check connection health every 10s
        serverSelectionRetryMS: 5000 // Retry server selection every 5s
    }).then((mongooseInstance) => {
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
        console.log(`   Database: ${mongooseInstance.connection.name}`);
        console.log(`   ReadyState: ${mongooseInstance.connection.readyState}`);
        return mongooseInstance.connection;
    }).catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        cachedConnection = null; // Clear cache on error
        throw err;
    });

    // Setup event handlers (only once)
    if (!mongoose.connection._eventsSetup) {
        mongoose.connection._eventsSetup = true;
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected - will reconnect on next request');
            cachedConnection = null;
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
            cachedConnection = null;
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });
    }

    return cachedConnection;
};

/**
 * Get connection status for health checks
 */
const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    return {
        isConnected: isConnected(),
        readyState: mongoose.connection.readyState,
        state: states[mongoose.connection.readyState] || 'unknown'
    };
};

module.exports = connectDB;
module.exports.isConnected = isConnected;
module.exports.getConnectionStatus = getConnectionStatus;