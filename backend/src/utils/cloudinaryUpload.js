const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Uploads an image to Cloudinary, converts to WebP, and generates a thumbnail
 * @param {string} localFilePath - Path to the locally saved file
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<Object>} - Object containing main image url and public_id
 */
const uploadToCloudinary = async (localFilePath, folder = 'attyer') => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'image',
      format: 'webp', // Automatic WebP conversion
      transformation: [
        { width: 1200, crop: 'limit' }, // Main image optimization
      ]
    });

    // We can also generate a specific thumbnail URL on the fly using Cloudinary's URL API, 
    // but the main image URL is returned here.
    // Example of thumbnail URL generation from public_id:
    // cloudinary.url(result.public_id, { width: 300, height: 400, crop: 'fill', format: 'webp' });

    // Clean up local file after upload
    fs.unlinkSync(localFilePath);

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove local file if upload fails
    throw error;
  }
};

module.exports = uploadToCloudinary;
