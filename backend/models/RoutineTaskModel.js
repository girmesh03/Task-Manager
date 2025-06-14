import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @typedef {object} PerformedTask
 * @property {string} description - Description of the specific routine task performed.
 * @property {boolean} isCompleted - Whether the task was completed.
 */

/**
 * @typedef {object} RoutineTask
 * @property {mongoose.Types.ObjectId} department - The department where the task was performed.
 * @property {mongoose.Types.ObjectId} performedBy - The user who performed the routine tasks.
 * @property {Date} date - The date the tasks were logged for.
 * @property {Array<PerformedTask>} performedTasks - The list of routine activities for that day.
 */

const routineTaskSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required."],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User who performed the task is required."],
      // Cross-document validation moved to RoutineTaskService.
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      // Validation against future dates is a business rule handled by the service.
    },
    performedTasks: [
      {
        description: {
          type: String,
          required: [true, "Task description is required."],
          trim: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
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
routineTaskSchema.index({ department: 1, date: -1 });
routineTaskSchema.index({ performedBy: 1, date: -1 });

// ===================== Plugins =====================
routineTaskSchema.plugin(mongoosePaginate);

// ===================== Middleware Hooks =====================
routineTaskSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const session = this.$session();
    try {
      // Clean up any notifications that link directly to this routine task.
      await mongoose
        .model("Notification")
        .deleteMany(
          { linkedDocument: this._id, linkedDocumentType: "RoutineTask" },
          { session }
        );
      next();
    } catch (err) {
      next(err);
    }
  }
);

const RoutineTask = mongoose.model("RoutineTask", routineTaskSchema);
export default RoutineTask;
