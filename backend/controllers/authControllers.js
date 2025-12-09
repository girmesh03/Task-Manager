import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Organization, Department, User } from "../models/index.js";
import {
  generateAccess_token,
  generateRefresh_token,
  setTokenCookies,
  clearTokenCookies,
} from "../utils/generateTokens.js";
import { USER_ROLES } from "../utils/constants.js";
import CustomError from "../errorHandler/CustomError.js";

// @desc    Register a new organization and super admin
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.body
  const { organization, department, user } = req.validated.body;

  // Start a new session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Business logic + Side Effects
    // 1. Create Organization
    const [newOrg] = await Organization.create([organization], { session });
    const orgId = newOrg._id;

    // 2. Create Department
    const [newDept] = await Department.create(
      [
        {
          name: department.name,
          description: department.description,
          organization: orgId,
        },
      ],
      { session }
    );
    const deptId = newDept._id;

    // 3. Create Super Admin User
    const [newUser] = await User.create(
      [
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          role: USER_ROLES.SUPER_ADMIN,
          organization: orgId,
          department: deptId,
          position: user.position || "Super Admin",
          phone: user.phone,
        },
      ],
      { session }
    );

    // 4. Update Organization createdBy
    newOrg.createdBy = newUser._id;
    await newOrg.save({ session });

    // 5. Update Department createdBy
    newDept.createdBy = newUser._id;
    await newDept.save({ session });

    await session.commitTransaction();

    // Send welcome email (Mock)
    console.log(`Sending welcome email to ${newUser.email}`);

    // Generate tokens and set cookies
    const access_token = generateAccess_token(newUser._id);
    const refresh_token = generateRefresh_token(newUser._id);
    setTokenCookies(res, access_token, refresh_token);

    // Response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          organization: newOrg,
          department: newDept,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.body
  const { email, password } = req.validated.body;

  // Business logic + Side Effects
  // Find user and select all select:false fields, populate org/dept with +isDeleted
  const user = await User.findOne({ email })
    .select("+password +isDeleted +passwordResetToken +passwordResetExpires")
    .populate({
      path: "organization",
      select: "+isDeleted",
    })
    .populate({
      path: "department",
      select: "+isDeleted",
    });

  if (!user || !(await user.comparePassword(password))) {
    throw CustomError.authenticated("Invalid email or password");
  }

  // Check if user is deleted
  if (user.isDeleted) {
    throw CustomError.authenticated("Account is deactivated");
  }

  // Check if organization is deleted
  if (user.organization && user.organization.isDeleted) {
    throw CustomError.authenticated("Organization is deactivated");
  }

  // Check if department is deleted
  if (user.department && user.department.isDeleted) {
    throw CustomError.authenticated("Department is deactivated");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens and set cookies
  const access_token = generateAccess_token(user._id);
  const refresh_token = generateRefresh_token(user._id);
  setTokenCookies(res, access_token, refresh_token);

  // Response
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department,
        profilePicture: user.profilePicture,
      },
    },
  });
});

// @desc    Logout user
// @route   DELETE /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  // Extract from req.user
  const { _id, organization, department, isHod, isPlatformUser } = req.user;

  // Business logic + Side Effects
  // Clear cookies
  clearTokenCookies(res);

  // Response
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// @desc    Refresh access token
// @route   GET /api/auth/refresh-token
// @access  Private
const refreshToken = asyncHandler(async (req, res, next) => {
  // Extract from req.user
  const user = req.user;

  // Business logic + Side Effects
  // Generate new tokens and set cookies
  const access_token = generateAccess_token(user._id);
  const refresh_token = generateRefresh_token(user._id);
  setTokenCookies(res, access_token, refresh_token);

  // Response
  res.status(200).json({
    success: true,
    message: "Token refreshed",
    data: {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department,
      },
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.body
  const { email } = req.validated.body;

  // Business logic + Side Effects
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email (Mock)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log(`Password reset email sent to ${email}. URL: ${resetUrl}`);
  }

  // Response
  res.status(200).json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Extract from req.validated.body
  const { token, password } = req.validated.body;

  // Business logic + Side Effects
  // Hash token to find user
  const crypto = await import("crypto");
  const hashedToken = crypto.default
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw CustomError.badRequest("Token is invalid or has expired");
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send confirmation email (Mock)
  console.log(`Password reset confirmation sent to ${user.email}`);

  // Response
  res.status(200).json({
    success: true,
    message: "Password reset successful. You can now login.",
  });
});

export { register, login, logout, refreshToken, forgotPassword, resetPassword };
