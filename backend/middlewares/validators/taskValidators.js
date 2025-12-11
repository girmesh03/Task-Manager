import { body, param, query } from 'express-validator';
import { BaseTask, User, Material, Vendor } from '../../models/index.js';
import validate from './validation.js';
import {
  TASK_TYPES,
  TASK_TYPES_ARRAY,
  TASK_PRIORITY_ARRAY,
  TASK_STATUS_ARRAY,
  ROUTINE_TASK_STATUS,
  ROUTINE_TASK_PRIORITY,
  LENGTH_LIMITS,
  LIMITS,
  SUPPORTED_CURRENCIES,
  HEAD_OF_DEPARTMENT_ROLES
} from '../../utils/constants.js';
import {
  dedupeIds,
  isStartDateTodayOrFuture,
  isStartDateBeforeDueDate,
  isDateNotInFuture
} from '../../utils/helpers.js';
import {
  validateAttachmentsArray,
  validateAttachmentFields
} from './attachmentValidators.js';

/**
 * Shared validators for base task fields
 */
const baseTaskFieldValidators = [
  body('taskType')
    .exists({ checkFalsy: true })
    .withMessage('taskType is required')
    .bail()
    .isIn(TASK_TYPES_ARRAY)
    .withMessage(`taskType must be one of: ${TASK_TYPES_ARRAY.join(', ')}`),

  body('title')
    .exists({ checkFalsy: true })
    .withMessage('Title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: LENGTH_LIMITS.MAX_TITLE_LENGTH })
    .withMessage(`Title must be between 1 and ${LENGTH_LIMITS.MAX_TITLE_LENGTH} characters`),

  body('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required')
    .bail()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH })
    .withMessage(
      `Description must be between 1 and ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`
    ),

  body('status')
    .optional({ nullable: true })
    .isString()
    .withMessage('Status must be a string')
    .bail()
    .custom((status, { req }) => {
      if (!status) return true;
      const type = req.body.taskType;
      const allowed =
        type === TASK_TYPES.ROUTINE_TASK ? ROUTINE_TASK_STATUS : TASK_STATUS_ARRAY;
      if (!allowed.includes(status)) {
        throw new Error(
          `Status must be one of: ${allowed.join(', ')} for ${type}`
        );
      }
      return true;
    }),

  body('priority')
    .optional({ nullable: true })
    .isString()
    .withMessage('Priority must be a string')
    .bail()
    .custom((priority, { req }) => {
      if (!priority) return true;
      const type = req.body.taskType;
      const allowed =
        type === TASK_TYPES.ROUTINE_TASK ? ROUTINE_TASK_PRIORITY : TASK_PRIORITY_ARRAY;
      if (!allowed.includes(priority)) {
        throw new Error(
          `Priority must be one of: ${allowed.join(', ')} for ${type}`
        );
      }
      return true;
    }),

  body('watcherIds')
    .optional({ nullable: true })
    .isArray()
    .withMessage('watcherIds must be an array')
    .bail()
    .custom((ids) => {
      if (ids?.length > LIMITS.MAX_WATCHERS) {
        throw new Error(
          `Watchers cannot exceed ${LIMITS.MAX_WATCHERS} users`
        );
      }
      return true;
    })
    .bail()
    .customSanitizer((ids) => dedupeIds(ids))
    .custom(async (ids, { req }) => {
      if (!ids || ids?.length === 0) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      const users = await User.find({
        _id: { $in: ids },
        organization: orgId,
        role: { $in: HEAD_OF_DEPARTMENT_ROLES },
        isDeleted: false,
      });
      if (users?.length !== ids?.length) {
        throw new Error(
          'All watchers must be SuperAdmin/Admin within your organization'
        );
      }
      return true;
    }),

  body('tags')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tags must be an array')
    .bail()
    .custom((tags) => {
      if (tags?.length > LIMITS.MAX_TAGS) {
        throw new Error(`Tags cannot exceed ${LIMITS.MAX_TAGS} items`);
      }
      const uniqueTags = new Set(
        tags.map((t) => t?.toLowerCase().trim()).filter(Boolean)
      );
      if (uniqueTags.size !== tags.filter((t) => t && t.trim())?.length) {
        throw new Error('Duplicate tags are not allowed');
      }
      for (const t of tags) {
        if (typeof t !== 'string') throw new Error('All tags must be strings');
        if (t.trim()?.length > LENGTH_LIMITS.MAX_TAG_LENGTH)
          throw new Error(
            `Each tag cannot exceed ${LENGTH_LIMITS.MAX_TAG_LENGTH} characters`
          );
      }
      return true;
    }),
];

/**
 * Type-specific validators for AssignedTask
 */
const assignedTaskValidators = [
  body('startDate')
    .if(body('taskType').equals(TASK_TYPES.ASSIGNED_TASK))
    .exists({ checkFalsy: true })
    .withMessage('Start date is required')
    .bail()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .bail()
    .custom((startDate) => {
      if (!isStartDateTodayOrFuture(startDate)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('dueDate')
    .if(body('taskType').equals(TASK_TYPES.ASSIGNED_TASK))
    .exists({ checkFalsy: true })
    .withMessage('Due date is required')
    .bail()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .bail()
    .custom((dueDate, { req }) => {
      if (!isStartDateBeforeDueDate(req.body.startDate, dueDate)) {
        throw new Error('Due date must be greater than or equal to start date');
      }
      return true;
    }),
  body('assigneeIds')
    .if(body('taskType').equals(TASK_TYPES.ASSIGNED_TASK))
    .exists({ checkFalsy: true })
    .withMessage('Assignee is required')
    .bail()
    .isMongoId()
    .withMessage('Assignee must be a valid MongoDB ID')
    .bail()
    .custom(async (assigneeId, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const user = await User.findOne({
        _id: assigneeId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!user) {
        throw new Error(
          'Assignee must belong to your organization and department'
        );
      }
      return true;
    }),
];

/**
 * Type-specific validators for ProjectTask
 */
const projectTaskValidators = [
  body('startDate')
    .if(body('taskType').equals(TASK_TYPES.PROJECT_TASK))
    .exists({ checkFalsy: true })
    .withMessage('Start date is required')
    .bail()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .bail()
    .custom((startDate) => {
      if (!isStartDateTodayOrFuture(startDate)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('dueDate')
    .if(body('taskType').equals(TASK_TYPES.PROJECT_TASK))
    .exists({ checkFalsy: true })
    .withMessage('Due date is required')
    .bail()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .bail()
    .custom((dueDate, { req }) => {
      if (!isStartDateBeforeDueDate(req.body.startDate, dueDate)) {
        throw new Error('Due date must be greater than or equal to start date');
      }
      return true;
    }),
  body('estimatedCost')
    .if(body('taskType').equals(TASK_TYPES.PROJECT_TASK))
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a non-negative number'),
  body('actualCost')
    .if(body('taskType').equals(TASK_TYPES.PROJECT_TASK))
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be a non-negative number'),
];

/**
 * Type-specific validators for RoutineTask
 */
const routineTaskValidators = [
  body('date')
    .if(body('taskType').equals(TASK_TYPES.ROUTINE_TASK))
    .exists({ checkFalsy: true })
    .withMessage('Routine task date is required')
    .bail()
    .isISO8601()
    .withMessage('Routine task date must be a valid ISO 8601 date')
    .bail()
    .custom((date) => {
      if (!isDateNotInFuture(date)) {
        throw new Error('Routine task log date cannot be in the future');
      }
      return true;
    }),

  body('materials')
    .if(body('taskType').equals(TASK_TYPES.ROUTINE_TASK))
    .optional({ nullable: true })
    .isArray()
    .withMessage('Materials must be an array of IDs')
    .bail()
    .custom((materials) => {
      if (materials?.length > LIMITS.MAX_MATERIALS) {
        throw new Error(
          `Materials cannot exceed ${LIMITS.MAX_MATERIALS} items`
        );
      }
      return true;
    }),
  body('materials.*')
    .if(body('taskType').equals(TASK_TYPES.ROUTINE_TASK))
    .isMongoId()
    .withMessage('Material ID must be a valid MongoDB ID')
    .bail()
    .custom(async (materialId, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const mat = await Material.findOne({
        _id: materialId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!mat) throw new Error('Material not found in your organization');
      return true;
    }),
];

const validateCreateTask = [
  ...baseTaskFieldValidators,
  validateAttachmentsArray,
  ...validateAttachmentFields,

  ...assignedTaskValidators,
  ...projectTaskValidators,
  ...routineTaskValidators,

  validate,
];

const validateGetAllTasks = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('taskType')
    .optional({ nullable: true })
    .isIn(TASK_TYPES_ARRAY)
    .withMessage(`taskType must be one of: ${TASK_TYPES_ARRAY.join(', ')}`),
  query('status')
    .optional({ nullable: true })
    .isString()
    .withMessage('status must be a string'),
  query('priority')
    .optional({ nullable: true })
    .isString()
    .withMessage('priority must be a string'),
  query('departmentId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('departmentId must be a valid MongoDB ID'),
  query('assigneeId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('assigneeId must be a valid MongoDB ID'),
  query('vendorId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('vendorId must be a valid MongoDB ID'),
  query('dueDateFrom')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dueDateFrom must be ISO 8601 date'),
  query('dueDateTo')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dueDateTo must be ISO 8601 date'),
  query('dateFrom')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dateFrom must be ISO 8601 date'),
  query('dateTo')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dateTo must be ISO 8601 date'),
  query('search')
    .optional({ nullable: true })
    .isString()
    .withMessage('search must be a string')
    .bail()
    .trim(),
  query('sortBy')
    .optional({ nullable: true })
    .isIn([
      'createdAt',
      'dueDate',
      'date',
      'priority',
      'status',
      'startDate',
      'title',
    ])
    .withMessage(
      'sortBy must be one of: createdAt, dueDate, date, priority, status, startDate, title'
    ),
  query('sortOrder')
    .optional({ nullable: true })
    .isIn(['asc', 'desc'])
    .withMessage("sortOrder must be 'asc' or 'desc'"),
  query('deleted')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('deleted must be boolean')
    .bail()
    .toBoolean(),
  query('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('createdBy must be a valid MongoDB ID'),
  query('watcherId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('watcherId must be a valid MongoDB ID'),
  query('tags')
    .optional({ nullable: true })
    .isArray()
    .withMessage('tags must be an array')
    .bail()
    .custom((tags) => {
      for (const t of tags) {
        if (typeof t !== 'string') throw new Error('All tags must be strings');
        if (t.trim()?.length > LENGTH_LIMITS.MAX_TAG_LENGTH)
          throw new Error(
            `Each tag cannot exceed ${LENGTH_LIMITS.MAX_TAG_LENGTH} characters`
          );
      }
      return true;
    }),

  validate,
];

const validateGetTask = [
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
      const deleted =
        req.query?.deleted === 'true' || req.query?.deleted === true;

      // Build query based on deleted flag
      let query = BaseTask.findOne({
        _id: taskId,
        organization: orgId,
        department: deptId,
      });

      if (deleted) {
        query = query.withDeleted();
      } else {
        query = query.where({ isDeleted: false });
      }

      const task = await query.exec();
      if (!task) throw new Error('Task not found in your organization');
      return true;
    }),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('Deleted must be a boolean')
    .toBoolean(),

  validate,
];

const validateUpdateTask = [
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
      // Attach found taskType for downstream validation decisions
      req.foundTaskType = task.taskType;
      return true;
    }),

  body('title')
    .optional({ nullable: true })
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: LENGTH_LIMITS.MAX_TITLE_LENGTH })
    .withMessage(`Title must be between 1 and ${LENGTH_LIMITS.MAX_TITLE_LENGTH} characters`),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH })
    .withMessage(
      `Description must be between 1 and ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`
    ),

  body('status')
    .optional({ nullable: true })
    .isString()
    .withMessage('Status must be a string')
    .bail()
    .custom((status, { req }) => {
      if (!status) return true;
      const type = req.foundTaskType;
      const allowed =
        type === TASK_TYPES.ROUTINE_TASK ? ROUTINE_TASK_STATUS : TASK_STATUS_ARRAY;
      if (!allowed.includes(status)) {
        throw new Error(
          `Status must be one of: ${allowed.join(', ')} for ${type}`
        );
      }
      return true;
    }),

  body('priority')
    .optional({ nullable: true })
    .isString()
    .withMessage('Priority must be a string')
    .bail()
    .custom((priority, { req }) => {
      if (!priority) return true;
      const type = req.foundTaskType;
      const allowed =
        type === TASK_TYPES.ROUTINE_TASK ? ROUTINE_TASK_PRIORITY : TASK_PRIORITY_ARRAY;
      if (!allowed.includes(priority)) {
        throw new Error(
          `Priority must be one of: ${allowed.join(', ')} for ${type}`
        );
      }
      return true;
    }),

  body('watcherIds')
    .optional({ nullable: true })
    .isArray()
    .withMessage('watcherIds must be an array')
    .bail()
    .custom((ids) => {
      if (ids?.length > LIMITS.MAX_WATCHERS) {
        throw new Error(
          `Watchers cannot exceed ${LIMITS.MAX_WATCHERS} users`
        );
      }
      return true;
    })
    .bail()
    .customSanitizer((ids) => dedupeIds(ids))
    .custom(async (ids, { req }) => {
      if (!ids || ids?.length === 0) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      const users = await User.find({
        _id: { $in: ids },
        organization: orgId,
        role: { $in: HEAD_OF_DEPARTMENT_ROLES },
        isDeleted: false,
      });
      if (users?.length !== ids?.length) {
        throw new Error(
          'All watchers must be SuperAdmin/Admin within your organization'
        );
      }
      return true;
    }),

  body('tags')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tags must be an array')
    .bail()
    .custom((tags) => {
      if (tags?.length > LIMITS.MAX_TAGS) {
        throw new Error(`Tags cannot exceed ${LIMITS.MAX_TAGS} items`);
      }
      const uniqueTags = new Set(
        tags.map((t) => t?.toLowerCase().trim()).filter(Boolean)
      );
      if (uniqueTags.size !== tags.filter((t) => t && t.trim())?.length) {
        throw new Error('Duplicate tags are not allowed');
      }
      for (const t of tags) {
        if (typeof t !== 'string') throw new Error('All tags must be strings');
        if (t.trim()?.length > LENGTH_LIMITS.MAX_TAG_LENGTH)
          throw new Error(
            `Each tag cannot exceed ${LENGTH_LIMITS.MAX_TAG_LENGTH} characters`
          );
      }
      return true;
    }),

  validateAttachmentsArray,
  ...validateAttachmentFields,

  // AssignedTask fields (conditional)
  body('startDate')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.ASSIGNED_TASK)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .bail()
    .custom((startDate) => {
      if (!isStartDateTodayOrFuture(startDate)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('dueDate')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.ASSIGNED_TASK)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .bail()
    .custom((dueDate, { req }) => {
      if (
        req.body.startDate &&
        !isStartDateBeforeDueDate(req.body.startDate, dueDate)
      ) {
        throw new Error('Due date must be greater than or equal to start date');
      }
      return true;
    }),
  body('assignee')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.ASSIGNED_TASK)
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Assignee must be a valid MongoDB ID')
    .bail()
    .custom(async (assigneeId, { req }) => {
      if (!assigneeId) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const user = await User.findOne({
        _id: assigneeId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!user) {
        throw new Error(
          'Assignee must belong to your organization and department'
        );
      }
      return true;
    }),

  // ProjectTask fields (conditional)
  body('startDate')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.PROJECT_TASK)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .bail()
    .custom((startDate) => {
      if (!isStartDateTodayOrFuture(startDate)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('dueDate')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.PROJECT_TASK)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .bail()
    .custom((dueDate, { req }) => {
      if (
        req.body.startDate &&
        !isStartDateBeforeDueDate(req.body.startDate, dueDate)
      ) {
        throw new Error('End date must be greater than or equal to start date');
      }
      return true;
    }),
  body('estimatedCost')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.PROJECT_TASK)
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a non-negative number'),
  body('actualCost')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.PROJECT_TASK)
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be a non-negative number'),

  // RoutineTask fields (conditional)
  body('date')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.ROUTINE_TASK)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Routine task date must be a valid ISO 8601 date')
    .bail()
    .custom((date) => {
      if (!isDateNotInFuture(date)) {
        throw new Error('Routine task log date cannot be in the future');
      }
      return true;
    }),
  body('materials')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.ROUTINE_TASK)
    .optional({ nullable: true })
    .isArray()
    .withMessage('Materials must be an array of IDs')
    .bail()
    .custom((materials) => {
      if (materials?.length > LIMITS.MAX_MATERIALS) {
        throw new Error(
          `Materials cannot exceed ${LIMITS.MAX_MATERIALS} items`
        );
      }
      return true;
    }),
  body('materials.*')
    .if((value, { req }) => req.foundTaskType === TASK_TYPES.ROUTINE_TASK)
    .isMongoId()
    .withMessage('Material ID must be a valid MongoDB ID')
    .bail()
    .custom(async (materialId, { req }) => {
      if (!materialId) return true;
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const mat = await Material.findOne({
        _id: materialId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!mat) throw new Error('Material not found in your organization');
      return true;
    }),

  validate,
];

const validateDeleteTask = [
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
      const exists = await BaseTask.findOne({
        _id: taskId,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!exists) throw new Error('Task not found in your organization');
      return true;
    }),

  validate,
];

const validateRestoreTask = [
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
      }).withDeleted();
      if (!task || task.isDeleted !== true) {
        throw new Error('Soft-deleted task not found in your organization');
      }
      return true;
    }),

  validate,
];

export {
  validateCreateTask,
  validateUpdateTask,
  validateGetTask,
  validateGetAllTasks,
  validateDeleteTask,
  validateRestoreTask
};
