import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { TASK_STATUS, TASK_PRIORITY, LIMITS, LENGTH_LIMITS } from '../utils/constants.js';

const baseTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_TITLE_LENGTH,
        `Title cannot exceed ${LENGTH_LIMITS.MAX_TITLE_LENGTH} characters`,
      ],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
      ],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUS),
        message: '{VALUE} is not a valid status',
      },
      default: TASK_STATUS.TO_DO,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TASK_PRIORITY),
        message: '{VALUE} is not a valid priority',
      },
      default: TASK_PRIORITY.MEDIUM,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxLength: [
            LENGTH_LIMITS.MAX_TAG_LENGTH,
            `Tag cannot exceed ${LENGTH_LIMITS.MAX_TAG_LENGTH} characters`,
          ],
        },
      ],
      validate: [
        (val) => val.length <= LIMITS.MAX_TAGS,
        `Cannot have more than ${LIMITS.MAX_TAGS} tags`,
      ],
      default: [],
    },
    watchers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: [
        (val) => val.length <= LIMITS.MAX_WATCHERS,
        `Cannot have more than ${LIMITS.MAX_WATCHERS} watchers`,
      ],
      default: [],
    },
    attachments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Attachment',
        },
      ],
      validate: [
        (val) => val.length <= LIMITS.MAX_ATTACHMENTS,
        `Cannot have more than ${LIMITS.MAX_ATTACHMENTS} attachments`,
      ],
      default: [],
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    discriminatorKey: 'taskType',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
baseTaskSchema.index({ organization: 1, department: 1 });
baseTaskSchema.index({ status: 1 });
baseTaskSchema.index({ priority: 1 });
baseTaskSchema.index({ createdBy: 1 });
baseTaskSchema.index({ taskType: 1 });

// Plugins
baseTaskSchema.plugin(softDeletePlugin, { ttl: 180 }); // 180 days TTL
baseTaskSchema.plugin(mongoosePaginate);

// Pre-save hooks
baseTaskSchema.pre('save', async function () {
  if (this.isNew) {
    // Validate organization exists
    const Organization = mongoose.model('Organization');
    const org = await Organization.findById(this.organization);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Validate department exists and belongs to organization
    const Department = mongoose.model('Department');
    const dept = await Department.findById(this.department);
    if (!dept) {
      throw new Error('Department not found');
    }
    if (dept.organization.toString() !== this.organization.toString()) {
      throw new Error('Department does not belong to the specified organization');
    }
  }
});

// Static method for soft delete with cascade
baseTaskSchema.statics.softDeleteByIdWithCascade = async function (
  id,
  { session, deletedBy } = {}
) {
  const task = await this.findById(id).session(session);
  if (!task) {
    throw new Error('Task not found');
  }

  // Soft delete the task
  await this.softDeleteById(id, { session, deletedBy });

  // Cascade delete related resources

  // 1. TaskComments (use their cascade method to handle nested comments)
  const TaskComment = mongoose.model('TaskComment');
  // Only delete root comments, let them cascade to children
  const comments = await TaskComment.find({ task: id, parent: null, isDeleted: false }).session(session);
  for (const comment of comments) {
    await TaskComment.softDeleteByIdWithCascade(comment._id, { session, deletedBy });
  }

  // 2. TaskActivities
  const TaskActivity = mongoose.model('TaskActivity');
  const activities = await TaskActivity.find({ task: id, isDeleted: false }).session(session);
  for (const activity of activities) {
    await activity.softDelete({ session, deletedBy });
  }

  // 3. Notifications (related to this task)
  const Notification = mongoose.model('Notification');
  const notifications = await Notification.find({ relatedTask: id, isDeleted: false }).session(session);
  for (const notification of notifications) {
    await notification.softDelete({ session, deletedBy });
  }
};

const BaseTask = mongoose.model('BaseTask', baseTaskSchema);

export default BaseTask;
