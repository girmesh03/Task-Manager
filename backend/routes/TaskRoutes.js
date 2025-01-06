import express from "express";

import {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/TaskController.js";

const router = express.Router();

router.route("/").get(getAllTasks).post(createTask);

router.route("/:taskId").get(getTask).delete(deleteTask);

router.route("/:taskId").patch(updateTask);

export default router;
