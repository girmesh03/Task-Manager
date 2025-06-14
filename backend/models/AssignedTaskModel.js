import mongoose from "mongoose";
import Task from "./TaskModel.js";

/**
 * @typedef {object} AssignedTask
 * @extends Task
 * @property {Array<mongoose.Types.ObjectId>} assignedTo - An array of user IDs assigned to this task.
 */

const assignedTaskSchema = new mongoose.Schema({
  assignedTo: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Assigned user is required."],
      },
    ],
    validate: {
      validator: (users) => users && users.length > 0,
      message: "At least one user must be assigned to the task.",
    },
    // Cross-document validation (ensuring users are in the same department)
    // is now handled by the TaskService for better performance.
  },
});

// Create the discriminator model. It will use the base Task schema and options.
const AssignedTask = Task.discriminator("AssignedTask", assignedTaskSchema);
export default AssignedTask;
