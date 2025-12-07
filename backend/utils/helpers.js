import mongoose from 'mongoose';
import crypto from 'crypto';

export const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

export const formatPaginatedResponse = (success, message, resourceName, docs, pagination) => {
  return {
    success,
    message,
    data: {
      [resourceName]: docs,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalCount: pagination.totalDocs,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNextPage,
        hasPrev: pagination.hasPrevPage,
      },
    },
  };
};

export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const sanitizeUser = (user) => {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;

  // Remove sensitive fields
  delete userObj.password;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.__v;
  delete userObj.isDeleted;
  delete userObj.deletedAt;
  delete userObj.deletedBy;

  return userObj;
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
