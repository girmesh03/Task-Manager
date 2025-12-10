import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import softDeletePlugin from './plugins/softDelete.js';
import { LIMITS, LENGTH_LIMITS } from '../utils/constants.js';

const taskCommentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseTask',
      required: [true, 'Task is required'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskComment',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxLength: [
        LENGTH_LIMITS.MAX_COMMENT_LENGTH,
        `Comment cannot exceed ${LENGTH_LIMITS.MAX_COMMENT_LENGTH} characters`,
      ],
    },
    mentions: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: [
        (val) => val.length <= LIMITS.MAX_MENTIONS,
        `Cannot have more than ${LIMITS.MAX_MENTIONS} mentions`,
      ],
      default: [],
    },
    depth: {
      type: Number,
      default: 0,
      min: [0, 'Depth cannot be negative'],
      max: [LIMITS.MAX_COMMENT_DEPTH, `Comment depth cannot exceed ${LIMITS.MAX_COMMENT_DEPTH}`],
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
taskCommentSchema.index({ task: 1 });
taskCommentSchema.index({ parent: 1 });
taskCommentSchema.index({ organization: 1, department: 1 });

// Plugins
taskCommentSchema.plugin(softDeletePlugin, { ttl: 90 }); // 90 days TTL
taskCommentSchema.plugin(mongoosePaginate);

// Pre-save hook: Calculate depth and enforce max depth
taskCommentSchema.pre('save', async function () {
  if (this.isNew && this.parent) {
    const parentComment = await this.constructor.findById(this.parent);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    this.depth = parentComment.depth + 1;

    if (this.depth > LIMITS.MAX_COMMENT_DEPTH) {
      throw new Error(`Comment depth cannot exceed ${LIMITS.MAX_COMMENT_DEPTH}`);
    }
  }
});

// Static method: Cascade delete child comments
taskCommentSchema.statics.softDeleteByIdWithCascade = async function (
  id,
  { session, deletedBy } = {}
) {
  const comment = await this.findById(id).session(session);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Soft delete the comment
  await this.softDeleteById(id, { session, deletedBy });

  // Find and delete all child comments
  const childComments = await this.find({ parent: id, isDeleted: false }).session(session);
  for (const child of childComments) {
    await this.softDeleteByIdWithCascade(child._id, { session, deletedBy });
  }
};

const TaskComment = mongoose.model('TaskComment', taskCommentSchema);

export default TaskComment;
