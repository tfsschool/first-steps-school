const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ ERROR: MONGO_URI is not defined in .env file');
            console.log('Please create a .env file in the server folder with:');
            console.log('MONGO_URI=mongodb://localhost:27017/first-steps-school');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n📋 Troubleshooting Steps:');
        console.log('1. Make sure MongoDB is installed and running');
        console.log('2. Check your .env file has the correct MONGO_URI');
        console.log('3. For local MongoDB, start it with: mongod');
        console.log('4. Or use MongoDB Atlas (cloud) - see README.md\n');
        process.exit(1);
    }
};

module.exports = connectDB;