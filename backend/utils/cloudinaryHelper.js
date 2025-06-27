import { v2 as cloudinary } from "cloudinary";
import CustomError from "../errorHandler/CustomError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Resource type mapping based on upload paths
const RESOURCE_TYPE_MAP = {
  "upload/profile": "image",
  "upload/attachments": ["image", "raw"],
  "upload/videos": "video",
};

/**
 * Deletes resources from Cloudinary based on path and resource type
 * @param {string|string[]} publicIds - Single ID or array of IDs
 * @param {string} uploadPath - Path category (profile/attachments/videos)
 * @returns {Promise<void>}
 * @throws {CustomError} On deletion failure
 */
export const deleteFromCloudinary = async (publicIds, uploadPath) => {
  // Handle empty input
  if (!publicIds || (Array.isArray(publicIds) && publicIds.length === 0)) {
    return;
  }

  // Get resource type from path mapping
  const resourceType = RESOURCE_TYPE_MAP[uploadPath];
  if (!resourceType) {
    throw new CustomError(
      `Invalid upload path: ${uploadPath}`,
      400,
      "CLOUDINARY-400"
    );
  }

  // Normalize to array
  const idsToDelete = Array.isArray(publicIds) ? publicIds : [publicIds];
  const BULK_LIMIT = 100;

  try {
    // Handle mixed resource types for attachments
    if (Array.isArray(resourceType)) {
      // Group by file extension to determine resource type
      const groupedResources = idsToDelete.reduce((acc, publicId) => {
        const extension = publicId.split(".").pop().toLowerCase();
        const type = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
          ? "image"
          : "raw";
        acc[type] = acc[type] || [];
        acc[type].push(publicId);
        return acc;
      }, {});

      // Process each resource type group
      for (const [type, ids] of Object.entries(groupedResources)) {
        for (let i = 0; i < ids.length; i += BULK_LIMIT) {
          const chunk = ids.slice(i, i + BULK_LIMIT);
          await cloudinary.api.delete_resources(chunk, {
            resource_type: type,
            type: "upload",
            invalidate: true,
          });
        }
      }
    }
    // Single resource type
    else {
      for (let i = 0; i < idsToDelete.length; i += BULK_LIMIT) {
        const chunk = idsToDelete.slice(i, i + BULK_LIMIT);
        await cloudinary.api.delete_resources(chunk, {
          resource_type: resourceType,
          type: "upload",
          invalidate: true,
        });
      }
    }
  } catch (error) {
    console.error(`Cloudinary Deletion Error (${uploadPath}):`, error);
    throw new CustomError(
      "Media cleanup failed on Cloudinary",
      500,
      "MEDIA-500",
      {
        publicIds: idsToDelete,
        uploadPath,
        resourceType,
        originalError: error.message,
      }
    );
  }
};

/**
 * Uploads a file to Cloudinary with path-based resource type handling
 * @param {Buffer} fileBuffer - File data buffer
 * @param {string} uploadPath - Path category (profile/attachments/videos)
 * @param {string} [fileName] - Original file name
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, uploadPath, fileName) => {
  const resourceType = RESOURCE_TYPE_MAP[uploadPath];
  if (!resourceType) {
    throw new CustomError(
      `Invalid upload path: ${uploadPath}`,
      400,
      "CLOUDINARY-400"
    );
  }

  // Determine actual resource type for attachments
  const actualType = Array.isArray(resourceType)
    ? fileName
      ? [".mp4", ".mov", ".avi"].some((ext) =>
          fileName.toLowerCase().endsWith(ext)
        )
        ? "video"
        : [".pdf", ".doc", ".docx", ".xls", ".xlsx"].some((ext) =>
            fileName.toLowerCase().endsWith(ext)
          )
        ? "raw"
        : "image"
      : "auto"
    : resourceType;

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadPath,
          resource_type: actualType,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error(`Cloudinary Upload Error (${uploadPath}):`, error);
    throw new CustomError(
      "Media upload failed to Cloudinary",
      500,
      "MEDIA-500",
      {
        uploadPath,
        fileName,
        originalError: error.message,
      }
    );
  }
};
