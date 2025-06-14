// backend/controllers/authController.js
import asyncHandler from "express-async-handler";
import * as AuthService from "../services/AuthService.js";
import * as UserService from "../services/UserService.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/GenerateTokens.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await AuthService.loginUser(email, password);

  generateAccessToken(res, user);
  generateRefreshToken(res, user);

  res.status(200).json({ data: user.toJSON(), message: "Login successful." });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await AuthService.verifyUserEmail(token);

  generateAccessToken(res, user);
  generateRefreshToken(res, user);

  res
    .status(200)
    .json({ data: user.toJSON(), message: "Email verified successfully." });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("access_token", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("refresh_token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ data: null, message: "Logged out successfully." });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await AuthService.forgotPasswordForUser(req.body.email);
  res.status(200).json({
    data: null,
    message:
      "If an account with that email exists, a reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await AuthService.resetUserPassword(req.params.resetToken, req.body.password);
  res.status(200).json({
    data: null,
    message: "Password has been reset successfully. Please log in.",
  });
});

export const getRefreshToken = asyncHandler(async (req, res) => {
  const user = await AuthService.refreshUserTokens(req.cookies.refresh_token);

  generateAccessToken(res, user);
  generateRefreshToken(res, user);

  res
    .status(200)
    .json({ data: null, message: "Tokens refreshed successfully." });
});

export const getMe = asyncHandler(async (req, res) => {
  // The user ID from the JWT is used to get the fresh, full user profile.
  const userProfile = await UserService.getUserProfile(req.user._id);
  res.status(200).json({
    data: userProfile,
    message: "User profile retrieved successfully.",
  });
});
