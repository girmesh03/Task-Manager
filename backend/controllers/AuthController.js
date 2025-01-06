import asyncHandler from "express-async-handler";
import CustomError from "../utils/CustomError.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signup = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, position } = req.body;

  if (!firstName || !lastName || !email || !password || !position) {
    return next(new CustomError("Please provide all fields", 400));
  }

  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    position,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30d",
  });

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Invalid email or password", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new CustomError("Invalid email or password", 401));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30d",
  });

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

export { signup, login };
