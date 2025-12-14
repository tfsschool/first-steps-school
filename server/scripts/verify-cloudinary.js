/**
 * Cloudinary Setup Verification Script
 * 
 * Run this script to verify your Cloudinary configuration:
 * node scripts/verify-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Verifying Cloudinary Configuration...\n');

// Check environment variables
const requiredVars = {
  'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
  'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
  'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET
};

let allPresent = true;
console.log('📋 Environment Variables:');
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Mask sensitive values
    const displayValue = key === 'CLOUDINARY_API_SECRET' 
      ? '*'.repeat(Math.min(value.length, 20)) + '...' 
      : value;
    console.log(`  ✅ ${key}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${key}: NOT SET`);
    allPresent = false;
  }
}

if (!allPresent) {
  console.log('\n❌ Missing required environment variables!');
  console.log('📝 Please add them to your server/.env file');
  console.log('📖 See CLOUDINARY_SETUP.md for instructions\n');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test connection
console.log('\n🔌 Testing Cloudinary Connection...');
cloudinary.api.ping((error, result) => {
  if (error) {
    console.log('❌ Connection Failed!');
    console.log('Error:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('  1. Invalid API credentials');
    console.log('  2. Network connectivity issues');
    console.log('  3. Cloudinary account not activated');
    process.exit(1);
  } else {
    console.log('✅ Connection Successful!');
    console.log('\n📊 Account Information:');
    console.log(`   Status: ${result.status}`);
    console.log(`   Service: ${result.service}`);
    console.log('\n🎉 Cloudinary is properly configured and ready to use!');
    console.log('\n📁 Your files will be stored in:');
    console.log('   - first-steps-school/cvs/ (CVs and Resumes)');
    console.log('   - first-steps-school/profile-pictures/ (Profile Pictures)');
  }
});
