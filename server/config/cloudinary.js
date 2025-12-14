const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Validate Cloudinary environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Cloudinary Configuration Error:');
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('\n📝 Please add the following to your .env file:');
  console.error('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.error('CLOUDINARY_API_KEY=your_api_key');
  console.error('CLOUDINARY_API_SECRET=your_api_secret');
  console.error('\n🔗 Get your credentials from: https://cloudinary.com/console');
  throw new Error(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configured successfully');

// Create storage for CVs/Resumes (PDFs and Word docs)
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'first-steps-school/cvs',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // For PDFs and Word docs
    transformation: [{ quality: 'auto' }]
  }
});

// Create storage for profile pictures (Images)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'first-steps-school/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image',
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
  }
});

module.exports = {
  cloudinary,
  cvStorage,
  imageStorage
};
