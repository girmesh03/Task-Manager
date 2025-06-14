// backend/routes/accountRoutes.js
import express from "express";
import {
  updateMyDetails,
  changeMyPassword,
  updateMyProfilePicture,
} from "../controllers/accountController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes in this file are protected and for the authenticated user's own account.
router.use(verifyJWT);

router.put("/details", updateMyDetails);
router.put("/password", changeMyPassword);
router.put("/profile-picture", updateMyProfilePicture);

export default router;
