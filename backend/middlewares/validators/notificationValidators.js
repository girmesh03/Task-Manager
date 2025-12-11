import { param, query } from 'express-validator';
import { Notification } from '../../models/index.js';
import validate from './validation.js';
import { NOTIFICATION_TYPES_ARRAY, PAGINATION } from '../../utils/constants.js';

const validateGetNotification = [
  param('notificationId')
    .isMongoId()
    .withMessage('Invalid notification ID')
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const notif = await Notification.findOne({
        _id: value,
        organization: orgId,
        department: deptId,
      }).withDeleted();
      if (!notif) {
        throw new Error('Notification not found in your organization');
      }
      return true;
    }),
  validate,
];

const validateMarkAsRead = [
  param('notificationId')
    .isMongoId()
    .withMessage('Invalid notification ID')
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const deptId = req.user?.department?._id || req.user?.department;
      const notif = await Notification.findOne({
        _id: value,
        organization: orgId,
        department: deptId,
        isDeleted: false,
      });
      if (!notif) {
        throw new Error('Notification not found in your organization');
      }
      return true;
    }),
  validate,
];

const validateGetAllNotifications = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT }),
  query('type')
    .optional()
    .isIn(NOTIFICATION_TYPES_ARRAY),
  query('isRead')
    .optional()
    .isBoolean(),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('deleted must be a boolean'),
  validate,
];

export {
  validateGetNotification,
  validateMarkAsRead,
  validateGetAllNotifications,
};
