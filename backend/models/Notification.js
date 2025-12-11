import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { NOTIFICATION_TYPES, LENGTH_LIMITS } from '../utils/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: '{VALUE} is not a valid notification type',
      },
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH,
        `Message cannot exceed ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
      ],
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseTask',
    },
    relatedActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskActivity',
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskComment',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ organization: 1 });
notificationSchema.index({ createdAt: 1 });

// Plugins
notificationSchema.plugin(softDeletePlugin, { ttl: 30 }); // 30 days TTL
notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
