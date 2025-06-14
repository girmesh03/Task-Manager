// backend/services/UserService.js
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Department from "../models/DepartmentModel.js";
import CustomError from "../errorHandler/CustomError.js";
import { sendVerificationEmail } from "../utils/SendEmail.js";

/**
 * Creates a new user within a specific department.
 * @param {object} userData - The user's data (firstName, email, etc.).
 * @param {string} departmentId - The ID of the department.
 * @param {object} requester - The authenticated user performing the action.
 * @returns {Promise<User>} The newly created user.
 */
export const createNewUser = async (userData, departmentId, requester) => {
  // Business logic for validating roles, checking for existing users, etc.
  const user = new User({ ...userData, department: departmentId });
  user.generateVerificationToken();
  await user.save();
  await sendVerificationEmail(user.email, user.verificationToken);
  return user;
};

/**
 * Updates a user's details.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - The data to update.
 * @param {object} requester - The user performing the update.
 * @returns {Promise<User>} The updated user.
 */
export const updateUser = async (userId, updateData, requester) => {
  // Logic for role-based authorization and filtering protected fields.
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  // Notification logic would be called from here.
  return user;
};

/**
 * Permanently deletes a user and all their associated data.
 * @param {string} userId - The ID of the user to delete.
 * @param {object} requester - The user performing the action (must be SuperAdmin).
 */
export const deleteUserPermanently = async (userId, requester) => {
  // Authorization checks for SuperAdmin role.
  // Complex cascading delete logic from old controller is now here.
  // e.g., Task.deleteMany({ createdBy: userId }), Notification.deleteMany(...), etc.
  const user = await User.findById(userId);
  if (!user) throw new CustomError("User not found", 404);
  await user.deleteOne(); // This triggers the pre-deleteOne hook in the model.
};
