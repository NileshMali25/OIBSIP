const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a file buffer to Cloudinary, or saves it locally as a fallback
 * @param {Buffer} fileBuffer - The file buffer from Multer memory storage
 * @param {string} folder - Target folder name on Cloudinary
 * @returns {Promise<string>} - The public secure URL of the uploaded image
 */
exports.uploadImage = async (fileBuffer, folder = 'pizza_delivery') => {
  if (!isCloudinaryConfigured) {
    // FALLBACK: Save locally to backend/uploads directory and return local URL
    console.log('[CLOUDINARY SERVICE] - Fallback: Saving image locally');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `local_${Date.now()}_${Math.round(Math.random() * 1e9)}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, fileBuffer);

    // Return URL relative to local server endpoint
    return `${process.env.CLIENT_URL ? 'http://localhost:5000' : ''}/uploads/${fileName}`;
  }

  // Upload to Cloudinary using streaming (avoids writing to disk)
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Cloudinary Upload Failed'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
