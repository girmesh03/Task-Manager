import asyncHandler from "express-async-handler";
import CustomError from "../utils/CustomError.js";
import Task from "../models/TaskModel.js";

const getAllTasks = asyncHandler(async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate({
        path: "assignedTo",
        select: "-password",
      })
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

const createTask = asyncHandler(async (req, res, next) => {
  const task = req.body;
  try {
    const newTask = await Task.create({
      title: task.title,
      description: task.description,
      status: task.status,
      date: task.date,
      location: task.location,
      assignedTo: task.assignedTo,
      priority: task.priority,
    });

    const response = await Task.findById(newTask._id).populate({
      path: "assignedTo",
      select: "-password",
    });

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

const getTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId).populate({
      path: "assignedTo",
      select: "-password",
    });

    if (!task) {
      return next(new CustomError(`No task found with id: ${taskId}`, 404));
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const task = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, task, {
      new: true,
    });

    if (!updatedTask) {
      return next(new CustomError(`No task found with id: ${taskId}`, 404));
    }

    const response = await Task.findById(taskId).populate({
      path: "assignedTo",
      select: "-password",
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return next(new CustomError(`No task found with id: ${taskId}`, 404));
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export { getAllTasks, createTask, getTask, updateTask, deleteTask };
