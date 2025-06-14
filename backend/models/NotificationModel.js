import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @typedef {object} Notification
 * @property {mongoose.Types.ObjectId} user - The recipient of the notification.
 * @property {string} message - The notification message content.
 * @property {string} type - The category of the notification.
 * @property {mongoose.Types.ObjectId} linkedDocument - A reference to a related document (e.g., a Task).
 * @property {string} linkedDocumentType - The model name of the linked document.
 * @property {boolean} isRead - Whether the user has read the notification.
 */

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required."],
      trim: true,
      maxlength: [200, "Message cannot exceed 200 characters."],
    },
    type: {
      type: String,
      enum: ["TaskAssignment", "TaskUpdate", "SystemAlert"],
      required: [true, "Notification type is required."],
    },
    // Using refPath allows this field to dynamically link to different models.
    linkedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "linkedDocumentType",
    },
    linkedDocumentType: {
      type: String,
      enum: ["Task", "User", "Department", "RoutineTask"],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
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
// TTL index to automatically delete notifications after 30 days.
// This is a highly efficient way to keep the collection clean.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
notificationSchema.index({ user: 1, isRead: 1 });

// ===================== Plugins =====================
notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
