// backend/controllers/taskController.js
import asyncHandler from "express-async-handler";
import * as TaskService from "../services/TaskService.js";

export const createTask = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const newTask = await TaskService.createNewTask(
    req.body,
    departmentId,
    req.user._id
  );
  res
    .status(201)
    .json({ data: newTask, message: "Task created successfully." });
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const result = await TaskService.getTasks(
    req.params.departmentId,
    req.user,
    req.query,
    req.pagination
  );
  res
    .status(200)
    .json({ data: result, message: "Tasks retrieved successfully." });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const taskDetails = await TaskService.getTaskDetails(req.params.taskId);
  res
    .status(200)
    .json({ data: taskDetails, message: "Task retrieved successfully." });
});

//... and so on for update, delete, and activity controllers.
