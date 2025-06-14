import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

/**
 * @typedef {object} Task (Base Schema)
 * @property {string} title - The title of the task.
 * @property {string} description - A detailed description.
 * @property {string} status - The current status ('To Do', 'In Progress', 'Completed', 'Pending').
 * @property {string} location - Physical location or room number relevant to the task.
 * @property {Date} dueDate - The deadline for the task.
 * @property {string} priority - The priority level ('Low', 'Medium', 'High').
 * @property {mongoose.Types.ObjectId} createdBy - The user who created the task.
 * @property {mongoose.Types.ObjectId} department - The department the task belongs to.
 */

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed", "Pending"],
      default: "To Do",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters."],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required."],
      // Validation for due date being in the future is a business rule,
      // now handled by the TaskService to keep the model clean.
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Validation is offloaded to TaskService.
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  {
    discriminatorKey: "taskType", // Key to differentiate between task types.
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ===================== Virtuals & Indexes =====================
taskSchema.virtual("activities", {
  ref: "TaskActivity",
  localField: "_id",
  foreignField: "task",
  options: { sort: { createdAt: -1 } },
});

taskSchema.index({ status: 1, department: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });

// ===================== Plugins =====================
taskSchema.plugin(mongoosePaginate);

// ===================== Middleware Hooks =====================

/**
 * Pre-deleteOne hook to clean up dependent documents and cloud assets.
 * This is crucial for maintaining data integrity and avoiding orphaned data.
 */
taskSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const session = this.$session();
    try {
      // If the task is a ProjectTask with file attachments, delete them from Cloudinary.
      if (this.taskType === "ProjectTask" && this.proforma?.length > 0) {
        const publicIds = this.proforma.map((p) => p.public_id).filter(Boolean);
        if (publicIds.length > 0) {
          // Use 'raw' resource type for non-image files like PDFs, docs.
          await deleteFromCloudinary(publicIds, "raw");
        }
      }

      // Clean up all related activities and notifications. Using `deleteMany` is efficient here.
      await Promise.all([
        mongoose
          .model("TaskActivity")
          .deleteMany({ task: this._id }, { session }),
        mongoose
          .model("Notification")
          .deleteMany({ linkedDocument: this._id }, { session }),
      ]);

      next();
    } catch (err) {
      next(err);
    }
  }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
