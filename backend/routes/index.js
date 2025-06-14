// backend/routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import accountRoutes from "./accountRoutes.js";
import adminRoutes from "./adminRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import routineTaskRoutes from "./routineTaskRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import statisticsRoutes from "./statisticsRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
router.use("/admin", adminRoutes);
router.use("/departments", departmentRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/routine-tasks", routineTaskRoutes);
router.use("/notifications", notificationRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/reports", reportRoutes);

export default router;
