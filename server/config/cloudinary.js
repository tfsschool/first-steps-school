const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Validate Cloudinary environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Cloudinary Configuration Error:');
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
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
 * Helper to determine if a file is a PDF based on format or filename
 */
const isPdf = (format, publicId) => {
  if (format === 'pdf') return true;
  if (typeof publicId === 'string' && publicId.toLowerCase().endsWith('.pdf')) return true;
  return false;
};

/**
 * Get preview URL (Optimized for display)
 * - PDFs: Returns the direct PDF URL (allows multi-page scrolling in browser)
 * - Images: Returns an optimized version (800px width)
 * - Docs: Returns the raw URL
 */
const getPreviewUrl = (publicId, resourceType, format) => {
  // CLEANUP: Ensure public_id doesn't already have extension to avoid double extension (e.g., file.pdf.pdf)
  let cleanPublicId = String(publicId || '').trim();
  
  // 1. Handle PDF specific logic (Crucial for multi-page viewing)
  if (isPdf(format, cleanPublicId)) {
    // If public_id has .pdf, strip it because we will enforce format: 'pdf'
    if (cleanPublicId.toLowerCase().endsWith('.pdf')) {
      cleanPublicId = cleanPublicId.slice(0, -4);
    }
    
    return cloudinary.url(cleanPublicId, {
      resource_type: resourceType === 'raw' ? 'raw' : 'image', // PDFs usually 'image', but handle 'raw' legacy
      secure: true,
      format: 'pdf' // Force .pdf extension so browser treats it as a document
      // NO transformations (quality/crop) here - we want the full PDF
    });
  }

  // 2. Handle Images (Optimize them)
  if (resourceType === 'image') {
    return cloudinary.url(cleanPublicId, {
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto', width: 800, crop: 'limit' }
      ],
      secure: true
    });
  }

  // 3. Handle Raw Files (Word docs, etc.)
  // Don't add extension for raw files if not needed, they usually rely on the stored filename
  return cloudinary.url(cleanPublicId, {
    resource_type: 'raw',
    secure: true
  });
};

/**
 * Get download URL (Forces browser to download file)
 */
const getDownloadUrl = (publicId, resourceType, format, originalFilename) => {
  let cleanPublicId = String(publicId || '').trim();

  // 1. Handle PDFs
  if (isPdf(format, cleanPublicId) || (originalFilename && originalFilename.toLowerCase().endsWith('.pdf'))) {
    if (cleanPublicId.toLowerCase().endsWith('.pdf')) {
      cleanPublicId = cleanPublicId.slice(0, -4);
    }
    return cloudinary.url(cleanPublicId, {
      resource_type: resourceType === 'raw' ? 'raw' : 'image',
      secure: true,
      format: 'pdf',
      flags: ['attachment'] // Force download
    });
  }

  // 2. Handle Word Docs / Others
  const lowerFormat = String(format || '').toLowerCase();
  if (resourceType === 'raw' && lowerFormat) {
     // For raw files, we generally just return the URL with attachment flag
     // If we try to force format on raw, Cloudinary might error or append incorrectly
     return cloudinary.url(cleanPublicId, {
       resource_type: 'raw',
       secure: true,
       flags: ['attachment']
     });
  }

  // 3. Handle Images
  return cloudinary.url(cleanPublicId, {
    resource_type: resourceType || 'auto',
    secure: true,
    flags: ['attachment']
  });
};

/**
 * Upload file to Cloudinary
 * FIX: Uploads PDFs as 'auto' (image) instead of 'raw' to allow browser viewing
 */
const uploadFile = async (buffer, folder, originalFilename) => {
  return new Promise((resolve, reject) => {
    const name = String(originalFilename || '').trim();
    const lowerName = name.toLowerCase();
    const ext = lowerName.includes('.') ? lowerName.split('.').pop() : '';
    
    // FIX: Only force 'raw' for Word documents. 
    // PDFs should be 'auto' (which becomes 'image' type) to allow proper viewing/thumbnails.
    const isWordDoc = ext === 'doc' || ext === 'docx';
    const forcedResourceType = isWordDoc ? 'raw' : 'auto';

    const uploadOptions = {
      folder: folder,
      resource_type: forcedResourceType,
      type: 'upload',
      access_mode: 'public',
      use_filename: true,
      unique_filename: true,
      overwrite: false
    };

    // Explicitly set format for non-raw files to ensure correct extension
    if (!isWordDoc && ext) {
      uploadOptions.format = ext;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          const fileInfo = {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: result.resource_type,
            original_filename: originalFilename || result.original_filename,
            // Generate preview and download URLs immediately
            preview_url: getPreviewUrl(result.public_id, result.resource_type, result.format || ext),
            download_url: getDownloadUrl(result.public_id, result.resource_type, result.format || ext, originalFilename)
          };
          resolve(fileInfo);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Normalize file data from DB to ensure it has preview/download URLs
 */
const normalizeFileData = (fileData) => {
  if (!fileData) return null;

  // 1. Handle New Object Format (already has data)
  if (typeof fileData === 'object' && fileData.public_id) {
    // Regenerate URLs to ensure they use the latest logic (e.g. fixing broken PDF links)
    const format = fileData.format || (fileData.secure_url.endsWith('.pdf') ? 'pdf' : undefined);
    
    return {
      ...fileData,
      preview_url: getPreviewUrl(fileData.public_id, fileData.resource_type, format),
      download_url: getDownloadUrl(fileData.public_id, fileData.resource_type, format, fileData.original_filename)
    };
  }
  
  // 2. Handle Old String URLs (Legacy support)
  if (typeof fileData === 'string') {
    // Strip existing flags if present
    const cleanUrl = fileData
      .replace('/upload/fl_attachment/', '/upload/')
      .replace('/upload/fl_attachment:', '/upload/');

    // Basic heuristic for download URL
    const downloadUrl = cleanUrl.includes('/upload/') 
      ? cleanUrl.replace('/upload/', '/upload/fl_attachment/') 
      : cleanUrl;

    return {
      preview_url: cleanUrl,
      download_url: downloadUrl,
      secure_url: cleanUrl
    };
  }
  
  return null;
};

// Legacy storage configs (kept for compatibility)
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'first-steps-school/cvs',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'first-steps-school/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'auto'
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