import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import User from "./UserModel.js";
import Task from "./TaskModel.js";
import RoutineTask from "./RoutineTaskModel.js";
import Notification from "./NotificationModel.js";
import CustomError from "../errorHandler/CustomError.js";

/**
 * @typedef {object} Department
 * @property {string} name - The unique name of the department.
 * @property {string} description - A brief description of the department's function.
 * @property {Array<mongoose.Types.ObjectId>} managers - A list of user IDs with manager-level roles for this department.
 */

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Department name must be at least 2 characters long."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters."],
    },
    managers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
      // Cross-document validation has been removed for performance.
      // This logic is now handled by the DepartmentService before saving.
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      // Date formatting is removed. API will return standard ISO strings.
      // The frontend is responsible for presentation.
      transform: (doc, ret) => {
        delete ret.id; // Remove redundant 'id' virtual field
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ===================== Indexes =====================
departmentSchema.index({ name: 1 });
departmentSchema.index({ managers: 1 });

// ===================== Plugins =====================
departmentSchema.plugin(mongoosePaginate);

// ===================== Middleware Hooks =====================

/**
 * Pre-deleteOne hook to perform a cascading delete of all related documents.
 * This ensures data integrity when a department is removed.
 * It's structured to trigger nested hooks (e.g., on User and Task models) for asset cleanup.
 */
departmentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const session = this.$session();
    const departmentId = this._id;

    // A SuperAdmin must initiate deletion. This is a final safeguard.
    if (!this.$currentUser || this.$currentUser.role !== "SuperAdmin") {
      return next(
        new CustomError(
          "Insufficient permissions for department deletion.",
          403
        )
      );
    }

    try {
      // Find Users and Tasks first to trigger their individual 'deleteOne' hooks,
      // which handle Cloudinary asset cleanup. This must be done one-by-one.
      const usersInDept = await User.find({ department: departmentId }).session(
        session
      );
      for (const user of usersInDept) {
        await user.deleteOne({ session });
      }

      const tasksInDept = await Task.find({ department: departmentId }).session(
        session
      );
      for (const task of tasksInDept) {
        await task.deleteOne({ session });
      }

      // For models without dependent assets (like RoutineTask or Notification),
      // we can use the highly performant `deleteMany`.
      await Promise.all([
        RoutineTask.deleteMany({ department: departmentId }).session(session),
        Notification.deleteMany({ department: departmentId }).session(session),
      ]);

      next();
    } catch (err) {
      next(err);
    }
  }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
