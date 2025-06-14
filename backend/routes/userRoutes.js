// backend/routes/userRoutes.js
import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/userController.js";
import {
  verifyJWT,
  authorizeRoles,
  verifyDepartmentAccess,
} from "../middlewares/authMiddleware.js";
import paginationMiddleware from "../middlewares/paginationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Routes for a specific department
router
  .route("/department/:departmentId")
  .post(
    authorizeRoles("Admin", "SuperAdmin"),
    verifyDepartmentAccess,
    createUser
  )
  .get(verifyDepartmentAccess, paginationMiddleware, getAllUsers);

// Routes for a specific user within a department
router
  .route("/department/:departmentId/user/:userId")
  .get(verifyDepartmentAccess, getUserById)
  .put(
    authorizeRoles("Admin", "SuperAdmin"),
    verifyDepartmentAccess,
    updateUserById
  )
  .delete(authorizeRoles("SuperAdmin"), verifyDepartmentAccess, deleteUserById);

export default router;
