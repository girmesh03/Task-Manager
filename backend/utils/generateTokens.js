import jwt from 'jsonwebtoken';
import { AUTH } from './constants.js';

/**
 * Generate Access Token
 * @param {string} userId - User ID
 * @returns {string} - JWT Access Token
 */
export const generateAccess_token = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: AUTH.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate Refresh Token
 * @param {string} userId - User ID
 * @returns {string} - JWT Refresh Token
 */
export const generateRefresh_token = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: AUTH.REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Set Token Cookies
 * @param {Object} res - Express Response Object
 * @param {string} access_token - Access Token
 * @param {string} refresh_token - Refresh Token
 */
export const setTokenCookies = (res, access_token, refresh_token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token Cookie
  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh Token Cookie
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
