import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { TASK_ACTIVITY_TYPES, LIMITS, LENGTH_LIMITS } from '../utils/constants.js';

const taskActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseTask',
      required: [true, 'Task is required'],
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: {
        values: Object.values(TASK_ACTIVITY_TYPES),
        message: '{VALUE} is not a valid activity type',
      },
    },
    description: {
      type: String,
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
      ],
    },
    materials: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
        },
      ],
      validate: [
        (val) => val.length <= LIMITS.MAX_MATERIALS,
        `Cannot have more than ${LIMITS.MAX_MATERIALS} materials`,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
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
taskActivitySchema.index({ task: 1 });
taskActivitySchema.index({ organization: 1, department: 1 });
taskActivitySchema.index({ createdBy: 1 });

// Plugins
taskActivitySchema.plugin(softDeletePlugin, { ttl: 90 }); // 90 days TTL
taskActivitySchema.plugin(mongoosePaginate);

// Validation: TaskActivity only for ProjectTask and AssignedTask
taskActivitySchema.pre('save', async function () {
  if (this.isNew) {
    const BaseTask = mongoose.model('BaseTask');
    const task = await BaseTask.findById(this.task);
    if (!task) {
      throw new Error('Task not found');
    }

    if (!['ProjectTask', 'AssignedTask'].includes(task.taskType)) {
      throw new Error('Task activities are only allowed for ProjectTask and AssignedTask');
    }
  }
});

const TaskActivity = mongoose.model('TaskActivity', taskActivitySchema);

export default TaskActivity;
