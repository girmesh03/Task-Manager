import express from 'express';
import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  updateProfile,
  getAccount,
  getProfile,
  deleteUser,
  restoreUser,
} from '../controllers/userControllers.js';
import {
  validateCreateUser,
  validateGetAllUsers,
  validateGetUser,
  validateUpdateUser,
  validateUpdateProfile,
} from '../middlewares/validators/userValidators.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorization.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

router.post(
  '/',
  authorize('User', 'create'),
  validateCreateUser,
  createUser
);

router.get(
  '/',
  authorize('User', 'read'),
  validateGetAllUsers,
  getAllUsers
);

router.get('/account', getAccount);
router.get('/profile', getProfile);

router.get(
  '/:userId',
  authorize('User', 'read'),
  validateGetUser,
  getUser
);

router.put(
  '/:userId',
  authorize('User', 'update'),
  validateUpdateUser,
  updateUser
);

router.put(
  '/:userId/profile',
  validateUpdateProfile,
  updateProfile
);

router.delete(
  '/:userId',
  authorize('User', 'delete'),
  validateGetUser,
  deleteUser
);

router.patch(
  '/:userId/restore',
  authorize('User', 'update'),
  validateGetUser,
  restoreUser
);

export default router;
