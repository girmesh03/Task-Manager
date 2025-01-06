import mongoose from "mongoose";

// Define Task Schema
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Pending", "To Do"],
      default: "To Do",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    location: {
      type: String,
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Task model
const Task = mongoose.model("Task", TaskSchema);

export default Task;
