const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ ERROR: MONGO_URI is not defined in .env file');
            console.log('Please create a .env file in the server folder with:');
            console.log('MONGO_URI=mongodb://localhost:27017/first-steps-school');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
        });
        
        isConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            isConnected = false;
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n📋 Troubleshooting Steps:');
        console.log('1. Make sure MongoDB is installed and running');
        console.log('2. Check your .env file has the correct MONGO_URI');
        console.log('3. For local MongoDB, start it with: mongod');
        console.log('4. Or use MongoDB Atlas (cloud) - see README.md\n');
        isConnected = false;
    }
};

module.exports = connectDB;