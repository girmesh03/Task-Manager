/**
 * Socket.IO Event Emitters
 *
 * Helper functions for emitting events to specific rooms.
 * Uses the socketInstance singleton to access the io server.
 *
 * @module utils/socketEmitter
 */

import { getIO } from './socketInstance.js';
import logger from './logger.js';

/**
 * Emit an event to multiple rooms
 * @param {string[]} rooms - Array of room names
 * @param {string} event - Event name
 * @param {object} data - Event payload
 */
export const emitToRooms = (rooms, event, data) => {
  try {
    const io = getIO();
    rooms.forEach((room) => {
      io.to(room).emit(event, data);
    });
    logger.debug(`Emitted ${event} to rooms: ${rooms.join(', ')}`);
  } catch (error) {
    logger.error(`Failed to emit ${event}: ${error.message}`);
  }
};

/**
 * Emit a task event to department and organization rooms
 * @param {object} task - Task object
 * @param {string} event - Event name (created, updated, deleted, restored)
 * @param {object} [additionalData={}] - Additional data to include
 */
export const emitTaskEvent = (task, event, additionalData = {}) => {
  const rooms = [
    `department:${task.department}`,
    `organization:${task.organization}`,
  ];
  emitToRooms(rooms, `task:${event}`, {
    task,
    ...additionalData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit a user event to user, department, and organization rooms
 * @param {object} user - User object
 * @param {string} event - Event name (online, offline, away, created, updated, deleted, restored)
 */
export const emitUserEvent = (user, event) => {
  const rooms = [
    `user:${user._id}`,
    `department:${user.department}`,
    `organization:${user.organization}`,
  ];
  emitToRooms(rooms, `user:${event}`, {
    userId: user._id,
    status: user.status || event,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit a notification event to user room only
 * @param {object} notification - Notification object
 */
export const emitNotificationEvent = (notification) => {
  const rooms = [`user:${notification.recipient}`];
  emitToRooms(rooms, 'notification:created', {
    notification,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit a task activity event to department and organization rooms
 * @param {object} activity - TaskActivity object
 * @param {string} event - Event name (created, updated, deleted)
 */
export const emitActivityEvent = (activity, event) => {
  const rooms = [
    `department:${activity.department}`,
    `organization:${activity.organization}`,
  ];
  emitToRooms(rooms, `activity:${event}`, {
    activity,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit a comment event to department and organization rooms
 * @param {object} comment - TaskComment object
 * @param {string} event - Event name (created, updated, deleted)
 */
export const emitCommentEvent = (comment, event) => {
  const rooms = [
    `department:${comment.department}`,
    `organization:${comment.organization}`,
  ];
  emitToRooms(rooms, `comment:${event}`, {
    comment,
    timestamp: new Date().toISOString(),
  });
};

export default {
  emitToRooms,
  emitTaskEvent,
  emitUserEvent,
  emitNotificationEvent,
  emitActivityEvent,
  emitCommentEvent,
};
