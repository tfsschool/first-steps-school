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
  if (format === 'pdf') {
    // Return a direct PDF URL (no image transformations).
    // Ensure public_id does not include .pdf to avoid ".pdf.pdf" when format is set.
    const options = {
      resource_type: resourceType || 'auto',
      secure: true,
      format: 'pdf'
    };

    let pdfPublicId = String(publicId || '').trim();
    const lowerPublicId = pdfPublicId.toLowerCase();
    if (lowerPublicId.endsWith('.pdf')) {
      pdfPublicId = pdfPublicId.slice(0, -4);
    }

    return cloudinary.url(pdfPublicId, options);
  }

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
    // For PDFs, also force format=pdf and ensure public_id does not include .pdf to avoid ".pdf.pdf".
    const options = {
      resource_type: resourceType || 'auto',
      secure: true
    };

    if (format === 'pdf') {
      let pdfPublicId = String(publicId || '').trim();
      const lowerPublicId = pdfPublicId.toLowerCase();
      if (lowerPublicId.endsWith('.pdf')) {
        pdfPublicId = pdfPublicId.slice(0, -4);
      }
      options.format = 'pdf';
      return cloudinary.url(pdfPublicId, options);
    }

    return cloudinary.url(publicId, options);
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

  // For PDFs, ensure correct extension
  if (format === 'pdf' || (originalFilename && originalFilename.toLowerCase().endsWith('.pdf'))) {
    // IMPORTANT:
    // When using cloudinary.url(..., { format: 'pdf' }), the SDK will append ".pdf".
    // So the public_id MUST NOT already include ".pdf", otherwise the URL becomes ".pdf.pdf".
    let pdfPublicId = String(publicId || '').trim();
    const lowerPublicId = pdfPublicId.toLowerCase();
    if (lowerPublicId.endsWith('.pdf')) {
      pdfPublicId = pdfPublicId.slice(0, -4);
    }

    // Use format: 'pdf' to ensure proper content-type header and correct extension
    options.format = 'pdf';
    return cloudinary.url(pdfPublicId, options);
  }

  // For other raw files (doc/docx, etc), keep their format if known
  if (resourceType === 'raw' && format) {
    // Similar to PDFs: if we set options.format, Cloudinary will append the extension,
    // so avoid duplicating it in public_id.
    let rawPublicId = String(publicId || '').trim();
    const lowerPublicId = rawPublicId.toLowerCase();
    const lowerFormat = String(format).toLowerCase();
    if (lowerFormat && lowerPublicId.endsWith(`.${lowerFormat}`)) {
      rawPublicId = rawPublicId.slice(0, -(lowerFormat.length + 1));
    }
    options.format = lowerFormat;
    return cloudinary.url(rawPublicId, options);
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

  const stripAttachmentFlagFromCloudinaryUrl = (url) => {
    if (typeof url !== 'string') return url;
    if (!url.includes('cloudinary.com')) return url;
    // Normalize URLs that were accidentally saved with download/attachment flag.
    // Example: .../upload/fl_attachment/v1/... -> .../upload/v1/...
    return url
      .replace('/upload/fl_attachment/', '/upload/')
      .replace('/upload/fl_attachment:', '/upload/');
  };

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
      const cleanUrl = stripAttachmentFlagFromCloudinaryUrl(fileData);

      // Extract public_id from Cloudinary URL
      const urlParts = cleanUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        // Determine resource type from URL path (preferred, avoids 404 from wrong resource type)
        // Typical Cloudinary URLs: /<cloud_name>/<resource_type>/upload/...
        // e.g. https://res.cloudinary.com/<cloud>/image/upload/... or /raw/upload/...
        let resourceType = 'auto';
        const resourceTypeCandidate = urlParts[uploadIndex - 1];
        if (resourceTypeCandidate === 'image' || resourceTypeCandidate === 'raw' || resourceTypeCandidate === 'video') {
          resourceType = resourceTypeCandidate;
        }

        // Find the folder and filename
        const versionIndex = urlParts.findIndex(part => part.match(/^v\d+$/));
        const startIndex = versionIndex !== -1 ? versionIndex + 1 : uploadIndex + 2;
        const publicIdParts = urlParts.slice(startIndex);
        // Build public_id from URL path.
        // For PDFs, we normalize to public_id WITHOUT the .pdf extension to avoid ".pdf.pdf" in generated URLs.
        const publicIdWithExt = publicIdParts.join('/');
        
        // Determine format from URL
        let format = null;
        
        // Extract format from URL if present (check both URL path and query params)
        const formatMatch = cleanUrl.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)(\?|$)/i);
        if (formatMatch) {
          format = formatMatch[1].toLowerCase();
        }

        let finalPublicId = publicIdWithExt;
        // Only strip the extension for PDFs.
        // For doc/docx we keep the extension in public_id to avoid serving/downloading as the wrong type.
        if (format === 'pdf' && String(finalPublicId).toLowerCase().endsWith(`.${format}`)) {
          finalPublicId = finalPublicId.slice(0, -(format.length + 1));
        }
        
        return {
          preview_url: getPreviewUrl(finalPublicId, resourceType, format),
          download_url: getDownloadUrl(finalPublicId, resourceType, format, null),
          secure_url: cleanUrl,
          public_id: finalPublicId,
          format: format,
          resource_type: resourceType
        };
      }
    } catch (error) {
      console.error('Error parsing Cloudinary URL:', error);
    }
    
    // Fallback: return as-is
    const cleanUrl = stripAttachmentFlagFromCloudinaryUrl(fileData);
    return {
      preview_url: cleanUrl,
      download_url: cleanUrl,
      secure_url: cleanUrl
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
    const lowerName = String(originalFilename || '').toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');
    const forcedResourceType = isPdf ? 'raw' : 'auto';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: forcedResourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          // Normalize stored public_id to NOT include extension.
          let publicId = result.public_id;
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
