// backend/utils/cloudinaryHelper.js
import { v2 as cloudinary } from "cloudinary";

// Configuration is done once when the module is first imported.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Deletes one or more resources from Cloudinary.
 * @param {string | string[]} publicIds - A single public_id or an array of public_ids.
 * @param {string} resourceType - The type of resource ('image', 'video', 'raw').
 */
export const deleteFromCloudinary = async (
  publicIds,
  resourceType = "image"
) => {
  if (!publicIds || (Array.isArray(publicIds) && publicIds.length === 0)) {
    return; // Nothing to delete
  }

  try {
    const idsToDelete = Array.isArray(publicIds) ? publicIds : [publicIds];

    // Using delete_resources is more efficient for multiple deletions of the same type.
    if (idsToDelete.length > 1) {
      await cloudinary.api.delete_resources(idsToDelete, {
        resource_type: resourceType,
      });
    } else {
      await cloudinary.uploader.destroy(idsToDelete[0], {
        resource_type: resourceType,
      });
    }
  } catch (error) {
    // In production, this should be logged to a proper monitoring service.
    // We don't throw an error to prevent a primary operation (e.g., user deletion)
    // from failing just because the asset cleanup failed.
    console.error("Cloudinary Deletion Error:", error.message);
  }
};

// It's cleaner to export the configured instance directly for use in multer-storage-cloudinary.
export default cloudinary;
