import { param, query } from 'express-validator';
import { BaseTask } from '../../models/index.js';
import validate from './validation.js';
import { PAGINATION } from '../../utils/constants.js';

const validateGetTaskActivities = [
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
  query('action')
    .optional({ nullable: true })
    .isString()
    .withMessage('Action must be a string'),
  query('performedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('performedBy must be a valid MongoDB ID'),
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

// Note: Task activities are generally system-generated.
// If manual creation is needed, add validateCreateTaskActivity here.

export { validateGetTaskActivities };
