import { body, param, query } from 'express-validator';
import { BaseTask, TaskComment, User } from '../../models/index.js';
import validate from './validation.js';
import {
  PAGINATION,
  LIMITS,
  LENGTH_LIMITS
} from '../../utils/constants.js';
import { dedupeIds } from '../../utils/helpers.js';
import {
  validateAttachmentsArray,
  validateAttachmentFields
} from './attachmentValidators.js';

const validateCreateTaskComment = [
  // Parent validation (Task or Comment)
  // We need to know if it's a root comment (on a Task) or a reply (on a Comment)
  // The route usually handles :taskId, but for replies we might have :commentId or body.parentId
  // Assuming standard route: POST /api/v1/tasks/:taskId/comments
  param('taskId')
    .exists({ checkFalsy: true })
    .withMessage('Task ID is required')
    .bail()
    .isMongoId()
    .withMessage('Task ID must be a valid MongoDB ID')
    .bail()
    .custom(async (taskId, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const task = await BaseTask.findOne({
        _id: taskId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!task) throw new Error('Task not found in your organization');
      return true;
    }),

  body('content')
    .exists({ checkFalsy: true })
    .withMessage('Content is required')
    .bail()
    .isString()
    .withMessage('Content must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH })
    .withMessage(
      `Content must be between 1 and ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`
    ),

  body('parentId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Parent ID must be a valid MongoDB ID')
    .bail()
    .custom(async (parentId, { req }) => {
      if (!parentId) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      // Check if parent comment exists and belongs to the same task
      const parent = await TaskComment.findOne({
        _id: parentId,
        organization: orgId,
        taskId: req.params.taskId,
        isDeleted: false,
      });
      if (!parent) {
        throw new Error('Parent comment not found in this task');
      }
      // Check depth (max 3 levels: Root -> Reply -> Reply)
      // If parent has a parent, and that parent has a parent, we can't reply.
      // Or simpler: store depth on comment.
      // For now, assuming we don't strictly enforce depth here without fetching hierarchy,
      // but we should if possible.
      // Let's assume the model handles depth or we just allow it for now.
      return true;
    }),

  body('mentionIds')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Mention IDs must be an array')
    .bail()
    .custom((mentionIds) => {
      if (mentionIds?.length > LIMITS.MAX_MENTIONS) {
        throw new Error(
          `Mentions cannot exceed ${LIMITS.MAX_MENTIONS} users`
        );
      }
      return true;
    })
    .customSanitizer((ids) => dedupeIds(ids))
    .custom(async (ids, { req }) => {
      if (!ids || ids?.length === 0) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const users = await User.find({
        _id: { $in: ids },
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (users?.length !== ids?.length) {
        throw new Error(
          'All mentioned users must belong to your organization and department'
        );
      }
      return true;
    }),

  validateAttachmentsArray,
  ...validateAttachmentFields,

  validate,
];

const validateUpdateTaskComment = [
  param('commentId')
    .exists({ checkFalsy: true })
    .withMessage('Comment ID is required')
    .bail()
    .isMongoId()
    .withMessage('Comment ID must be a valid MongoDB ID')
    .bail()
    .custom(async (commentId, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const comment = await TaskComment.findOne({
        _id: commentId,
        organization: orgId,
        isDeleted: false,
      });
      if (!comment) throw new Error('Comment not found');
      // Ensure user owns the comment
      if (comment.author.toString() !== req.user._id.toString()) {
        throw new Error('You can only update your own comments');
      }
      return true;
    }),

  body('content')
    .optional({ nullable: true })
    .isString()
    .withMessage('Content must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH })
    .withMessage(
      `Content must be between 1 and ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`
    ),

  body('mentionIds')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Mentions must be an array')
    .bail()
    .custom((mentions) => {
      if (mentions?.length > LIMITS.MAX_MENTIONS) {
        throw new Error(
          `Mentions cannot exceed ${LIMITS.MAX_MENTIONS} users`
        );
      }
      return true;
    })
    .customSanitizer((ids) => dedupeIds(ids))
    .custom(async (ids, { req }) => {
      if (!ids || ids?.length === 0) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const users = await User.find({
        _id: { $in: ids },
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (users?.length !== ids?.length) {
        throw new Error(
          'All mentioned users must belong to your organization and department'
        );
      }
      return true;
    }),

  validateAttachmentsArray,
  ...validateAttachmentFields,

  validate,
];

const validateDeleteTaskComment = [
  param('commentId')
    .exists({ checkFalsy: true })
    .withMessage('Comment ID is required')
    .bail()
    .isMongoId()
    .withMessage('Comment ID must be a valid MongoDB ID')
    .bail()
    .custom(async (commentId, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const comment = await TaskComment.findOne({
        _id: commentId,
        organization: orgId,
        isDeleted: false,
      });
      if (!comment) throw new Error('Comment not found');
      // Ensure user owns the comment OR is admin/manager (depending on policy)
      // For now, assume only author can delete, or maybe admin.
      // Let's stick to author for now or check role.
      if (
        comment.author.toString() !== req.user._id.toString() &&
        !['SuperAdmin', 'Admin', 'Manager'].includes(req.user.role)
      ) {
        throw new Error('You do not have permission to delete this comment');
      }
      return true;
    }),

  validate,
];

const validateGetTaskComments = [
  param('taskId')
    .exists({ checkFalsy: true })
    .withMessage('Task ID is required')
    .bail()
    .isMongoId()
    .withMessage('Task ID must be a valid MongoDB ID')
    .bail()
    .custom(async (taskId, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const task = await BaseTask.findOne({
        _id: taskId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!task) throw new Error('Task not found in your organization');
      return true;
    }),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
  query('sortBy')
    .optional({ nullable: true })
    .isIn(['createdAt'])
    .withMessage('sortBy must be: createdAt'),
  query('sortOrder')
    .optional({ nullable: true })
    .isIn(['asc', 'desc'])
    .withMessage("sortOrder must be 'asc' or 'desc'"),

  validate,
];

export {
  validateCreateTaskComment,
  validateUpdateTaskComment,
  validateDeleteTaskComment,
  validateGetTaskComments
};
