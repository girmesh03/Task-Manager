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

export const isValidObjectId = validateObjectId;

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

export const generateEmployeeId = () => {
  // Random 4-digit number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const dedupeIds = (arr) =>
  Array.isArray(arr)
    ? [...new Set(arr.map((id) => (id ? id.toString() : id)).filter(Boolean))]
    : [];

export const isStartDateTodayOrFuture = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

export const isStartDateBeforeDueDate = (startDateString, dueDateString) => {
  if (!startDateString || !dueDateString) return true;
  const start = new Date(startDateString);
  const due = new Date(dueDateString);
  return due >= start;
};

export const isDateNotInFuture = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  const now = new Date();
  return date <= now;
};
