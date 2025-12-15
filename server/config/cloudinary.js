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

/**
 * Get preview URL (optimized for display)
 * - Images: Optimized with quality auto, format auto, max width 800px
 * - PDFs: Original URL (no transformation for PDFs)
 */
const getPreviewUrl = (publicId, resourceType, format) => {
  if (resourceType === 'image') {
    // Optimized preview for images: high quality but optimized size
    return cloudinary.url(publicId, {
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto', width: 800, crop: 'limit' }
      ],
      secure: true
    });
  } else {
    // For PDFs and other files, return original (no preview transformation)
    return cloudinary.url(publicId, {
      resource_type: resourceType || 'auto',
      secure: true
    });
  }
};

/**
 * Get download URL (original file with attachment flag)
 * - Forces download with correct file extension
 * - Uses fl_attachment for proper file download
 */
const getDownloadUrl = (publicId, resourceType, format, originalFilename) => {
  const options = {
    resource_type: resourceType || 'auto',
    secure: true,
    flags: ['attachment'] // Forces download instead of inline display
  };

  // For PDFs and other raw files, ensure correct extension
  if (resourceType === 'raw' || format === 'pdf' || 
      (originalFilename && originalFilename.toLowerCase().endsWith('.pdf'))) {
    // For raw files (PDFs), Cloudinary needs the extension in the public_id
    // Also need to ensure proper content-type by using the format parameter
    let pdfPublicId = String(publicId || '').trim();
    
    // CRITICAL: Check if it already ends with .pdf (case-insensitive) to avoid double extension
    const lowerPublicId = pdfPublicId.toLowerCase();
    if (!lowerPublicId.endsWith('.pdf')) {
      pdfPublicId = pdfPublicId + '.pdf';
    }
    
    // Use format: 'pdf' to ensure proper content-type header
    options.format = 'pdf';
    return cloudinary.url(pdfPublicId, options);
  }

  // For images, return original format
  if (format && resourceType === 'image') {
    options.format = format;
  }

  return cloudinary.url(publicId, options);
};

/**
 * Helper function to normalize file data (handles both old string URLs and new object format)
 * Returns object with preview_url and download_url
 */
const normalizeFileData = (fileData) => {
  // Handle null, undefined, or empty values
  if (!fileData) {
    return null;
  }

  // If it's already an object with the new format, return it
  if (typeof fileData === 'object' && fileData.public_id) {
    return {
      preview_url: fileData.preview_url || fileData.secure_url,
      download_url: fileData.download_url || fileData.secure_url,
      secure_url: fileData.secure_url,
      public_id: fileData.public_id,
      format: fileData.format,
      resource_type: fileData.resource_type
    };
  }
  
  // If it's a string URL (old format), try to extract public_id and generate URLs
  if (typeof fileData === 'string' && fileData.includes('cloudinary.com')) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = fileData.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        // Find the folder and filename
        const versionIndex = urlParts.findIndex(part => part.match(/^v\d+$/));
        const startIndex = versionIndex !== -1 ? versionIndex + 1 : uploadIndex + 2;
        const publicIdParts = urlParts.slice(startIndex);
        // Keep the full public_id including extension - Cloudinary stores it with extension for raw files
        const publicId = publicIdParts.join('/');
        
        // Determine resource type and format from URL
        let resourceType = 'auto';
        let format = null;
        
        if (fileData.includes('/image/')) {
          resourceType = 'image';
        } else if (fileData.includes('/raw/') || fileData.includes('/pdf') || fileData.includes('resource_type=raw')) {
          resourceType = 'raw';
          format = 'pdf';
        }
        
        // Extract format from URL if present (check both URL path and query params)
        const formatMatch = fileData.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)(\?|$)/i);
        if (formatMatch) {
          format = formatMatch[1].toLowerCase();
        }
        
        // For raw files (PDFs), ensure public_id has .pdf extension if format is pdf
        // This prevents getDownloadUrl from adding it again
        let finalPublicId = publicId;
        if (resourceType === 'raw' && format === 'pdf') {
          // Only add .pdf if it doesn't already end with it (case-insensitive check)
          const lowerPublicId = publicId.toLowerCase();
          if (!lowerPublicId.endsWith('.pdf')) {
            finalPublicId = publicId + '.pdf';
          }
        }
        
        return {
          preview_url: getPreviewUrl(finalPublicId, resourceType, format),
          download_url: getDownloadUrl(finalPublicId, resourceType, format, null),
          secure_url: fileData,
          public_id: finalPublicId,
          format: format,
          resource_type: resourceType
        };
      }
    } catch (error) {
      console.error('Error parsing Cloudinary URL:', error);
    }
    
    // Fallback: return as-is
    return {
      preview_url: fileData,
      download_url: fileData,
      secure_url: fileData
    };
  }
  
  // If it's a string but not a Cloudinary URL, return as-is
  if (typeof fileData === 'string') {
    return {
      preview_url: fileData,
      download_url: fileData,
      secure_url: fileData
    };
  }
  
  return null;
};

/**
 * Upload file to Cloudinary with resource_type: "auto"
 * Returns object with public_id, secure_url, preview_url, download_url, format, resource_type
 */
const uploadFile = async (buffer, folder, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Automatically detects image, video, or raw (PDF)
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          // For raw files (PDFs), ensure public_id includes the extension
          let publicId = result.public_id;
          if (result.resource_type === 'raw' && originalFilename && originalFilename.toLowerCase().endsWith('.pdf')) {
            // If public_id doesn't end with .pdf, add it
            if (!publicId.toLowerCase().endsWith('.pdf')) {
              publicId = publicId + '.pdf';
            }
          }
          
          const fileInfo = {
            public_id: publicId,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: result.resource_type,
            original_filename: originalFilename || result.original_filename,
            // Generate preview and download URLs
            preview_url: getPreviewUrl(publicId, result.resource_type, result.format),
            download_url: getDownloadUrl(publicId, result.resource_type, result.format, originalFilename)
          };
          resolve(fileInfo);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Legacy storage configurations (kept for backward compatibility if needed)
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'first-steps-school/cvs',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true
  }
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'first-steps-school/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true
  }
});

module.exports = {
  cloudinary,
  cvStorage,
  imageStorage,
  uploadFile,
  getPreviewUrl,
  getDownloadUrl,
  normalizeFileData
};
