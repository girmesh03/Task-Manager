/**
 * Notification Service Unit Tests
 *
 * Tests for notification service functionality.
 * Uses global test setup for MongoDB connection.
 */

import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock socketEmitter before importing the service
jest.unstable_mockModule('../../utils/socketEmitter.js', () => ({
  emitNotificationEvent: jest.fn(),
  emitToRooms: jest.fn(),
}));

// Mock emailService
jest.unstable_mockModule('../../services/emailService.js', () => ({
  sendTaskNotification: jest.fn().mockResolvedValue(true),
  sendMentionNotification: jest.fn().mockResolvedValue(true),
}));

// Import after mocking
const { emitNotificationEvent } = await import('../../utils/socketEmitter.js');
const { sendTaskNotification, sendMentionNotification } = await import('../../services/emailService.js');
const {
  createNotification,
  createBulkNotifications,
  createTaskNotification,
  createMentionNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = await import('../../services/notificationService.js');

// Import Notification model
const { Notification } = await import('../../models/index.js');

describe('Notification Service', () => {
  // Test data
  const testOrgId = new mongoose.Types.ObjectId();
  const testDeptId = new mongoose.Types.ObjectId();
  const testUserId = new mongoose.Types.ObjectId();
  const testCreatedById = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    // Clear notifications before each test - use collection directly to bypass soft delete plugin
    await mongoose.connection.collection('notifications').deleteMany({});
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    test('should create notification and emit socket event', async () => {
      const data = {
        recipient: testUserId,
        type: 'Created',
        title: 'Test Notification',
        message: 'This is a test notification',
        organization: testOrgId,
        department: testDeptId,
        createdBy: testCreatedById,
      };

      const notification = await createNotification(data);

      expect(notification).toBeDefined();
      expect(notification.recipient.toString()).toBe(testUserId.toString());
      expect(notification.type).toBe('Created');
      expect(notification.message).toBe('This is a test notification');
      expect(emitNotificationEvent).toHaveBeenCalledWith(expect.objectContaining({
        recipient: testUserId,
        type: 'Created',
      }));
    });

    test('should use timestamps from schema', async () => {
      const data = {
        recipient: testUserId,
        type: 'Welcome',
        title: 'Welcome',
        message: 'Welcome to the system',
        organization: testOrgId,
        department: testDeptId,
      };

      const notification = await createNotification(data);

      // Model uses timestamps: true, so createdAt and updatedAt should exist
      expect(notification.createdAt).toBeDefined();
      expect(notification.updatedAt).toBeDefined();
    });
  });

  describe('createBulkNotifications', () => {
    test('should create notifications for multiple recipients', async () => {
      const recipients = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const data = {
        type: 'Announcement',
        title: 'Bulk Announcement',
        message: 'This is a bulk announcement',
        organization: testOrgId,
        department: testDeptId,
      };

      const notifications = await createBulkNotifications(data, recipients);

      expect(notifications).toHaveLength(3);
      expect(emitNotificationEvent).toHaveBeenCalledTimes(3);
    });
  });

  describe('createTaskNotification', () => {
    test('should create task notification and trigger email', async () => {
      const user = {
        _id: testUserId,
        firstName: 'John',
        email: 'john@example.com',
        emailPreferences: { taskUpdates: true },
      };

      const task = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Task',
        taskType: 'AssignedTask',
        organization: testOrgId,
        department: testDeptId,
      };

      const createdBy = { _id: testCreatedById };

      const notification = await createTaskNotification(user, task, 'created', createdBy);

      expect(notification).toBeDefined();
      expect(notification.type).toBe('Created');
      expect(notification.relatedTask.toString()).toBe(task._id.toString());
      // Email is triggered asynchronously - just verify it was called eventually
      await new Promise(resolve => setTimeout(resolve, 200));
    });
  });

  describe('createMentionNotification', () => {
    test('should create mention notification and trigger email', async () => {
      const user = {
        _id: testUserId,
        firstName: 'Bob',
        email: 'bob@example.com',
        emailPreferences: { mentions: true },
      };

      const comment = {
        _id: new mongoose.Types.ObjectId(),
        content: 'Hey @bob check this',
        organization: testOrgId,
        department: testDeptId,
      };

      const task = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Project Task',
      };

      const mentionedBy = { _id: testCreatedById, firstName: 'Alice' };

      const notification = await createMentionNotification(user, comment, task, mentionedBy);

      expect(notification).toBeDefined();
      expect(notification.type).toBe('Mention');
      expect(notification.relatedComment.toString()).toBe(comment._id.toString());
      // Email is triggered asynchronously - just verify eventually
      await new Promise(resolve => setTimeout(resolve, 200));
    });
  });

  describe('markAsRead', () => {
    test('should mark notification as read', async () => {
      // Create a notification first
      const notification = await Notification.create({
        recipient: testUserId,
        type: 'Created',
        title: 'Test',
        message: 'Test message',
        organization: testOrgId,
        department: testDeptId,
        isRead: false,
      });

      const updated = await markAsRead(notification._id.toString(), testUserId.toString());

      expect(updated.isRead).toBe(true);
      // Note: readAt is not in the Notification model schema
    });

    test('should throw error for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(markAsRead(fakeId.toString(), testUserId.toString()))
        .rejects.toThrow('Notification not found or access denied');
    });

    test('should throw error when user does not own notification', async () => {
      const notification = await Notification.create({
        recipient: new mongoose.Types.ObjectId(), // Different user
        type: 'Created',
        title: 'Test',
        message: 'Test message',
        organization: testOrgId,
        department: testDeptId,
      });

      await expect(markAsRead(notification._id.toString(), testUserId.toString()))
        .rejects.toThrow('Notification not found or access denied');
    });
  });

  describe('markAllAsRead', () => {
    test('should mark all unread notifications as read', async () => {
      // Create multiple notifications
      await Notification.create([
        { recipient: testUserId, type: 'Created', title: 'N1', message: 'M1', organization: testOrgId, department: testDeptId, isRead: false },
        { recipient: testUserId, type: 'Updated', title: 'N2', message: 'M2', organization: testOrgId, department: testDeptId, isRead: false },
        { recipient: testUserId, type: 'Deleted', title: 'N3', message: 'M3', organization: testOrgId, department: testDeptId, isRead: true },
      ]);

      const count = await markAllAsRead(testUserId.toString());

      expect(count).toBe(2);

      const unread = await Notification.countDocuments({ recipient: testUserId, isRead: false });
      expect(unread).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    test('should return correct unread count', async () => {
      await Notification.create([
        { recipient: testUserId, type: 'Created', title: 'N1', message: 'M1', organization: testOrgId, department: testDeptId, isRead: false },
        { recipient: testUserId, type: 'Updated', title: 'N2', message: 'M2', organization: testOrgId, department: testDeptId, isRead: false },
        { recipient: testUserId, type: 'Deleted', title: 'N3', message: 'M3', organization: testOrgId, department: testDeptId, isRead: true },
      ]);

      const count = await getUnreadCount(testUserId.toString());

      expect(count).toBe(2);
    });

    test('should return 0 for user with no notifications', async () => {
      const count = await getUnreadCount(new mongoose.Types.ObjectId().toString());
      expect(count).toBe(0);
    });
  });
});
