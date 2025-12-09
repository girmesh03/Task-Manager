import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/index.js';
import CustomError from '../errorHandler/CustomError.js';

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    throw CustomError.authenticated('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Select all fields with select:false and populate organization/department with +isDeleted
    const user = await User.findById(decoded.userId)
      .select('+isDeleted +password +passwordResetToken +passwordResetExpires')
      .populate({
        path: 'organization',
        select: '+isDeleted'
      })
      .populate({
        path: 'department',
        select: '+isDeleted'
      });

    if (!user) {
      throw CustomError.authenticated('Not authorized, user not found');
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw CustomError.authenticated('Not authorized, user account is deactivated');
    }

    // Check if organization is deleted
    if (user.organization && user.organization.isDeleted) {
      throw CustomError.authenticated('Not authorized, organization is deactivated');
    }

    // Check if department is deleted
    if (user.department && user.department.isDeleted) {
      throw CustomError.authenticated('Not authorized, department is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw CustomError.authenticated('Not authorized, token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw CustomError.authenticated('Not authorized, invalid token');
    }
    throw error;
  }
});

const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    throw CustomError.authenticated('Not authorized, no refresh token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Select all fields with select:false and populate organization/department with +isDeleted
    const user = await User.findById(decoded.userId)
      .select('+isDeleted +password +passwordResetToken +passwordResetExpires')
      .populate({
        path: 'organization',
        select: '+isDeleted'
      })
      .populate({
        path: 'department',
        select: '+isDeleted'
      });

    if (!user) {
      throw CustomError.authenticated('Not authorized, user not found');
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw CustomError.authenticated('Not authorized, user account is deactivated');
    }

    // Check if organization is deleted
    if (user.organization && user.organization.isDeleted) {
      throw CustomError.authenticated('Not authorized, organization is deactivated');
    }

    // Check if department is deleted
    if (user.department && user.department.isDeleted) {
      throw CustomError.authenticated('Not authorized, department is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw CustomError.authenticated('Not authorized, refresh token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw CustomError.authenticated('Not authorized, invalid refresh token');
    }
    throw error;
  }
});

export { verifyJWT, verifyRefreshToken };
