// backend/services/AuthService.js
import crypto from "crypto";
import User from "../models/UserModel.js";
import CustomError from "../errorHandler/CustomError.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../utils/SendEmail.js";

/**
 * Handles user login.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<User>} The authenticated user document.
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new CustomError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await user.matchPassword(password))) {
    throw new CustomError("Invalid credentials.", 401);
  }

  if (!user.isVerified)
    throw new CustomError("Please verify your email first.", 403);
  if (!user.isActive)
    throw new CustomError("Your account has been deactivated.", 403);

  return user;
};

/**
 * Verifies a user's email with a token.
 * @param {string} token - The verification token from the user.
 * @returns {Promise<User>} The verified user document.
 */
export const verifyUserEmail = async (token) => {
  if (!token) {
    throw new CustomError("Verification token is required.", 400);
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new CustomError("Invalid or expired verification token.", 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  return user;
};

/**
 * Initiates the password reset process for a user.
 * @param {string} email - The email of the user requesting a password reset.
 */
export const forgotPasswordForUser = async (email) => {
  if (!email) {
    throw new CustomError("Email is required.", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  // We don't throw an error if the user doesn't exist to prevent email enumeration attacks.
  if (user && user.isVerified) {
    user.generatePasswordResetToken();
    await user.save();

    // In a real application, the CLIENT_URL would be configured for different environments.
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${user.resetPasswordToken}`;
    await sendResetPasswordEmail(user.email, resetURL);
  }
};

/**
 * Resets a user's password using a valid token.
 * @param {string} token - The password reset token from the URL.
 * @param {string} newPassword - The new password.
 */
export const resetUserPassword = async (token, newPassword) => {
  if (!newPassword) {
    throw new CustomError("New password is required.", 400);
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new CustomError("Invalid or expired password reset token.", 400);
  }

  user.password = newPassword;
  user.tokenVersion += 1; // Invalidate all existing login sessions for security.
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
};

/**
 * Refreshes a user's access and refresh tokens.
 * @param {string} currentRefreshToken - The user's current refresh token.
 * @returns {Promise<User>} The user document for generating new tokens.
 */
export const refreshUserTokens = async (currentRefreshToken) => {
  if (!currentRefreshToken) {
    throw new CustomError("Unauthorized: No refresh token provided.", 401);
  }

  const decoded = jwt.verify(
    currentRefreshToken,
    process.env.JWT_REFRESH_SECRET
  );
  const user = await User.findById(decoded._id);

  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    throw new CustomError("Forbidden: Token has been revoked.", 403);
  }
  if (!user.isActive) {
    throw new CustomError("Forbidden: Account has been deactivated.", 403);
  }

  // Incrementing tokenVersion is optional on refresh, but good for session rotation.
  user.tokenVersion += 1;
  await user.save();
  return user;
};
