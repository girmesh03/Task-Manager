import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import CustomError from "../errorHandler/CustomError.js";

/**
 * @typedef {object} TaskActivity
 * @property {mongoose.Types.ObjectId} task - The parent task this activity belongs to.
 * @property {mongoose.Types.ObjectId} performedBy - The user who performed the activity.
 * @property {string} description - A log of what was done.
 * @property {object} statusChange - An object recording a status transition.
 * @property {Array<object>} attachments - Any files attached to this specific activity.
 */

const taskActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required."],
      // Expensive validation offloaded to TaskService.
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
    },
    description: {
      type: String,
      required: [true, "Activity description is required."],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters."],
    },
    statusChange: {
      from: {
        type: String,
        enum: ["To Do", "In Progress", "Completed", "Pending"],
      },
      to: {
        type: String,
        enum: ["To Do", "In Progress", "Completed", "Pending"],
      },
    },
    attachments: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        type: {
          type: String,
          enum: ["image", "pdf", "doc", "xls", "other"],
          default: "other",
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {},
  }
);

// ===================== Indexes =====================
taskActivitySchema.index({ task: 1, createdAt: -1 });
taskActivitySchema.index({ performedBy: 1 });

// ===================== Plugins =====================
taskActivitySchema.plugin(mongoosePaginate);

// ===================== Middleware Hooks =====================

/**
 * Pre-save middleware to manage the parent task's status based on this activity.
 * This acts as a state machine to ensure valid status transitions.
 */
taskActivitySchema.pre("save", async function (next) {
  // Only run this logic if a statusChange is part of the activity.
  if (!this.isModified("statusChange") || !this.statusChange.to) {
    return next();
  }

  const session = this.$session();
  const Task = mongoose.model("Task");
  const task = await Task.findById(this.task).session(session);

  if (!task) {
    return next(new CustomError("Associated task not found.", 404));
  }

  const fromStatus = this.statusChange.from || task.status;
  const toStatus = this.statusChange.to;

  // Rule 1: The 'from' status must match the task's current status.
  if (fromStatus !== task.status) {
    return next(
      new CustomError(
        `State mismatch: Activity transition is from '${fromStatus}', but task status is '${task.status}'.`,
        409 // HTTP 409 Conflict is appropriate for state mismatches.
      )
    );
  }

  // Rule 2: The transition must be valid according to the state machine.
  const validTransitions = {
    "To Do": ["In Progress", "Pending"],
    "In Progress": ["Completed", "Pending"],
    Pending: ["In Progress", "To Do"],
    Completed: [], // No transitions out of 'Completed' via activity.
  };

  if (!validTransitions[fromStatus]?.includes(toStatus)) {
    return next(
      new CustomError(
        `Invalid status transition from '${fromStatus}' to '${toStatus}'.`,
        400
      )
    );
  }

  // If validation passes, update the parent task's status.
  task.status = toStatus;
  await task.save({ session });

  next();
});

const TaskActivity = mongoose.model("TaskActivity", taskActivitySchema);
export default TaskActivity;
