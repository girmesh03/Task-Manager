import asyncHandler from "express-async-handler";
// import CustomError from "../utils/CustomError.js";
import User from "../models/UserModel.js";

const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

export { getAllUsers }
