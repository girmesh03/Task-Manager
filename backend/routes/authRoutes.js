import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/authControllers.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../middlewares/validators/authValidators.js';
import { verifyRefreshToken } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.delete('/logout', verifyRefreshToken, logout);
router.get('/refresh-token', authLimiter, verifyRefreshToken, refreshToken);
router.post(
  '/forgot-password',
  authLimiter,
  validateForgotPassword,
  forgotPassword
);
router.post(
  '/reset-password',
  authLimiter,
  validateResetPassword,
  resetPassword
);

export default router;
