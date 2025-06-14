// backend/routes/authRoutes.js
import express from "express";
import {
  login,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,
  getRefreshToken,
  getMe,
} from "../controllers/authController.js";
import authLimiter from "../middlewares/rateLimiter.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:resetToken", authLimiter, resetPassword);

router.get("/refresh", getRefreshToken);
router.post("/logout", logout); // No rate limit on logout

router.get("/me", verifyJWT, getMe);

export default router;
