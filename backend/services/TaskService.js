// backend/services/TaskService.js
import mongoose from "mongoose";
import Task from "../models/TaskModel.js";
import AssignedTask from "../models/AssignedTaskModel.js";
import ProjectTask from "../models/ProjectTaskModel.js";
import TaskActivity from "../models/TaskActivityModel.js";
import CustomError from "../errorHandler/CustomError.js";

/**
 * Creates a new task (Assigned or Project).
 * @param {object} taskData - Data for the new task.
 * @param {string} departmentId - Department ID.
 * @param {string} creatorId - User ID of the creator.
 * @returns {Promise<Task>} The created task.
 */
export const createNewTask = async (taskData, departmentId, creatorId) => {
  // All business logic for validating task types, assigned users, etc.
  // All notification logic for new assignments.
};

/**
 * Adds a new activity to a task.
 * @param {string} taskId - The ID of the parent task.
 * @param {object} activityData - The data for the new activity.
 * @param {object} user - The user performing the action.
 * @returns {Promise<TaskActivity>} The created activity.
 */
export const addTaskActivity = async (taskId, activityData, user) => {
  // Authorization logic to ensure the user can log activity.
  // The model's pre-save hook handles the state machine, but the service
  // orchestrates the creation and any related notifications.
  const activity = new TaskActivity({
    task: taskId,
    performedBy: user._id,
    ...activityData,
  });
  await activity.save();
  return activity.populate("performedBy");
};
