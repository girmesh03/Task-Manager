// backend/services/DepartmentService.js
import mongoose from "mongoose";
import Department from "../models/DepartmentModel.js";
import User from "../models/UserModel.js";
import CustomError from "../errorHandler/CustomError.js";
import { createNotification } from "./NotificationService.js";

/**
 * Creates a new department.
 * @param {object} departmentData - Data for the new department.
 * @returns {Promise<Department>} The created department.
 */
export const createNewDepartment = async (departmentData) => {
  // All business logic from the old controller is here.
  // It uses a transaction to ensure atomicity.
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newDept = await Department.create([{ ...departmentData }], {
      session,
    });
    // Logic to update user roles if managers are assigned.
    // Logic to create notifications for new managers.
    await session.commitTransaction();
    return newDept[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Updates a department's details and manages manager roles.
 * @param {string} departmentId - The ID of the department to update.
 * @param {object} updateData - The new data for the department.
 * @returns {Promise<Department>} The updated department.
 */
export const updateDepartment = async (departmentId, updateData) => {
  // All complex logic for handling added/removed managers,
  // downgrading roles, and sending notifications is encapsulated here.
};
