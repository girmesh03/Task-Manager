/**
 * Notification Service
 *
 * Handles notification creation, Socket.IO emission, and email sending.
 *
 * @module services/notificationService
 */

import { Notification } from '../models/index.js';
import { emitNotificationEvent } from '../utils/socketEmitter.js';
import {
  sendTaskNotification,
  sendMentionNotification,
} from './emailService.js';
import logger from '../utils/logger.js';

/**
 * Create a single notification
 * @param {object} data - Notification data
 * @param {string} data.recipient - Recipient user ID
 * @param {string} data.type - Notification type (Created, Updated, Deleted, Restored, Mention, Welcome, Announcement)
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} [data.relatedResource] - Related resource ID
 * @param {string} [data.relatedModel] - Related model name
 * @param {string} data.organization - Organization ID
 * @param {string} [data.department] - Department ID
 * @param {string} [data.createdBy] - User who created the notification
 * @param {object} [session] - Mongoose session for transactions
 * @returns {Promise<object>} Created notification
 */
export const createNotification = async (data, session = null) => {
  try {
    const notificationData = {
      ...data,
    };

    // Create notification (handle both with and without session)
    let notification;
    if (session) {
      [notification] = await Notification.create([notificationData], { session });
    } else {
      notification = await Notification.create(notificationData);
    }

    // Emit Socket.IO event to user room
    emitNotificationEvent(notification);

    logger.info(`Notification created for user ${data.recipient}: ${data.title}`);

    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    throw error;
  }
};

/**
 * Create notifications for multiple recipients
 * @param {object} data - Base notification data
 * @param {string[]} recipients - Array of recipient user IDs
 * @param {object} [session] - Mongoose session for transactions
 * @returns {Promise<object[]>} Created notifications
 */
export const createBulkNotifications = async (data, recipients, session = null) => {
  const notifications = await Promise.all(
    recipients.map((recipient) =>
      createNotification({ ...data, recipient }, session)
    )
  );
  return notifications;
};

/**
 * Create task notification for a user
 * @param {object} user - Recipient user object (with email preferences)
 * @param {object} task - Task object
 * @param {string} action - Action performed (created, updated, deleted, restored)
 * @param {object} createdBy - User who performed the action
 * @param {object} [session] - Mongoose session for transactions
 * @returns {Promise<object>} Created notification
 */
export const createTaskNotification = async (user, task, action, createdBy, session = null) => {
  // Create in-app notification
  const notification = await createNotification(
    {
      recipient: user._id,
      type: action.charAt(0).toUpperCase() + action.slice(1), // Capitalize
      title: `Task ${action}`,
      message: `Task "${task.title}" has been ${action}`,
      relatedTask: task._id,
      organization: task.organization,
      department: task.department,
    },
    session
  );

  // Send email notification (async, don't await)
  sendTaskNotification(user, task, action).catch((err) =>
    logger.error(`Failed to send task email: ${err.message}`)
  );

  return notification;
};

/**
 * Create mention notification for a user
 * @param {object} user - Mentioned user object
 * @param {object} comment - Comment object
 * @param {object} task - Associated task object
 * @param {object} createdBy - User who mentioned
 * @param {object} [session] - Mongoose session for transactions
 * @returns {Promise<object>} Created notification
 */
export const createMentionNotification = async (user, comment, task, createdBy, session = null) => {
  // Create in-app notification
  const notification = await createNotification(
    {
      recipient: user._id,
      type: 'Mention',
      title: 'You were mentioned',
      message: `${createdBy?.firstName || 'Someone'} mentioned you in "${task.title}"`,
      relatedComment: comment._id,
      organization: comment.organization,
      department: comment.department,
    },
    session
  );

  // Send email notification (async, don't await)
  sendMentionNotification(user, comment, task).catch((err) =>
    logger.error(`Failed to send mention email: ${err.message}`)
  );

  return notification;
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<object>} Updated notification
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found or access denied');
  }

  return notification;
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return result.modifiedCount;
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

export default {
  createNotification,
  createBulkNotifications,
  createTaskNotification,
  createMentionNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
