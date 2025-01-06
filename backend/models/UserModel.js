import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    position: {
      type: String,
      required: true,
      enum: [
        "Cheif Engineer",
        "Electrician",
        "HAVC Technician",
        "Plumber",
        "Painter",
        "General Mechanic",
        "Wood Work Technician",
        "Civil Work Technician",
        "Lift Attendant",
      ],
    },
  },
  { timestamps: true }
);

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;
