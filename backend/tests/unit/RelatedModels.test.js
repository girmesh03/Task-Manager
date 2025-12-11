import { describe, test, expect, beforeEach } from '@jest/globals';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import ProjectTask from '../../models/ProjectTask.js';
import RoutineTask from '../../models/RoutineTask.js';
import TaskActivity from '../../models/TaskActivity.js';
import TaskComment from '../../models/TaskComment.js';
import Attachment from '../../models/Attachment.js';
import Notification from '../../models/Notification.js';
import Vendor from '../../models/Vendor.js';
import { INDUSTRIES, TASK_ACTIVITY_TYPES, NOTIFICATION_TYPES } from '../../utils/constants.js';

describe('Related Models (Activity, Comment, Attachment, Notification)', () => {
  let testOrg;
  let testDept;
  let testUser;
  let testVendor;
  let testProjectTask;
  let testRoutineTask;

  beforeEach(async () => {
    testOrg = await Organization.create({
      name: 'Related Models Test Org',
      email: 'relatedorg@example.com',
      phone: '+251912340005',
      industry: INDUSTRIES[0],
    });

    testDept = await Department.create({
      name: 'Related Models Test Dept',
      organization: testOrg._id,
    });

    testUser = await User.create({
      firstName: 'Related',
      lastName: 'Tester',
      email: 'relatedtester@example.com',
      password: 'password123',
      organization: testOrg._id,
      department: testDept._id,
    });

    testVendor = await Vendor.create({
      name: 'Related Test Vendor',
      organization: testOrg._id,
    });

    testProjectTask = await ProjectTask.create({
      title: 'Test Project Task',
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
      vendor: testVendor._id,
    });

    testRoutineTask = await RoutineTask.create({
      title: 'Test Routine Task',
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
      date: new Date('2025-01-01'),
    });
  });

  describe('TaskActivity Model', () => {
    test('should create activity for ProjectTask', async () => {
      const activity = await TaskActivity.create({
        task: testProjectTask._id,
        activityType: TASK_ACTIVITY_TYPES.STATUS_CHANGED,
        description: 'Status changed to In Progress',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      expect(activity._id).toBeDefined();
      expect(activity.activityType).toBe(TASK_ACTIVITY_TYPES.STATUS_CHANGED);
      expect(activity.task.toString()).toBe(testProjectTask._id.toString());
    });

    test('should fail for RoutineTask (not allowed)', async () => {
      await expect(
        TaskActivity.create({
          task: testRoutineTask._id,
          activityType: TASK_ACTIVITY_TYPES.MATERIAL_ADDED,
          description: 'Materials added',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow('Task activities are only allowed for ProjectTask and AssignedTask');
    });

    test('should enforce max materials limit', async () => {
      const materials = Array(51).fill(testUser._id); // Over limit
      await expect(
        TaskActivity.create({
          task: testProjectTask._id,
          activityType: TASK_ACTIVITY_TYPES.MATERIAL_ADDED,
          materials,
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });
  });

  describe('TaskComment Model', () => {
    test('should create root comment', async () => {
      const comment = await TaskComment.create({
        task: testProjectTask._id,
        content: 'This is a root comment',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      expect(comment._id).toBeDefined();
      expect(comment.depth).toBe(0);
      expect(comment.content).toBe('This is a root comment');
      expect(comment.parent).toBeUndefined();
    });

    test('should create nested comment with depth 1', async () => {
      const rootComment = await TaskComment.create({
        task: testProjectTask._id,
        content: 'Root comment',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      const childComment = await TaskComment.create({
        task: testProjectTask._id,
        parent: rootComment._id,
        content: 'Child comment',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      expect(childComment.depth).toBe(1);
    });

    test('should enforce max depth of 3', async () => {
      const depth0 = await TaskComment.create({
        task: testProjectTask._id,
        content: 'Depth 0',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      const depth1 = await TaskComment.create({
        task: testProjectTask._id,
        parent: depth0._id,
        content: 'Depth 1',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      const depth2 = await TaskComment.create({
        task: testProjectTask._id,
        parent: depth1._id,
        content: 'Depth 2',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      const depth3 = await TaskComment.create({
        task: testProjectTask._id,
        parent: depth2._id,
        content: 'Depth 3',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      expect(depth3.depth).toBe(3);

      // Depth 4 should fail
      await expect(
        TaskComment.create({
          task: testProjectTask._id,
          parent: depth3._id,
          content: 'Depth 4 (too deep)',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow('Comment depth cannot exceed 3');
    });

    test('should enforce max mentions limit', async () => {
      const mentions = Array(11).fill(testUser._id);
      await expect(
        TaskComment.create({
          task: testProjectTask._id,
          content: 'Too many mentions',
          mentions,
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });
  });

  describe('Attachment Model', () => {
    test('should create attachment with valid data', async () => {
      const attachment = await Attachment.create({
        filename: 'test-file.jpg',
        originalName: 'Test Image.jpg',
        url: 'https://res.cloudinary.com/test/image.jpg',
        publicId: 'test-public-id',
        mimeType: 'image/jpeg',
        size: 5242880, // 5MB
        uploadedBy: testUser._id,
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(attachment._id).toBeDefined();
      expect(attachment.filename).toBe('test-file.jpg');
      expect(attachment.mimeType).toBe('image/jpeg');
    });

    test('should fail if image size exceeds limit', async () => {
      await expect(
        Attachment.create({
          filename: 'large-image.jpg',
          originalName: 'Large Image.jpg',
          url: 'https://res.cloudinary.com/test/large.jpg',
          publicId: 'large-public-id',
          mimeType: 'image/jpeg',
          size: 15728640, // 15MB (over 10MB limit)
          uploadedBy: testUser._id,
          organization: testOrg._id,
          department: testDept._id,
        })
      ).rejects.toThrow('Image size cannot exceed 10MB');
    });

    test('should fail if video size exceeds limit', async () => {
      await expect(
        Attachment.create({
          filename: 'large-video.mp4',
          originalName: 'Large Video.mp4',
          url: 'https://res.cloudinary.com/test/video.mp4',
          publicId: 'video-public-id',
          mimeType: 'video/mp4',
          size: 157286400, // 150MB (over 100MB limit)
          uploadedBy: testUser._id,
          organization: testOrg._id,
          department: testDept._id,
        })
      ).rejects.toThrow('Video size cannot exceed 100MB');
    });
  });

  describe('Notification Model', () => {
    test('should create notification with valid data', async () => {
      const notification = await Notification.create({
        recipient: testUser._id,
        type: NOTIFICATION_TYPES.CREATED,
        message: 'New task created',
        relatedTask: testProjectTask._id,
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(notification._id).toBeDefined();
      expect(notification.type).toBe(NOTIFICATION_TYPES.CREATED);
      expect(notification.isRead).toBe(false);
      expect(notification.recipient.toString()).toBe(testUser._id.toString());
    });

    test('should default isRead to false', async () => {
      const notification = await Notification.create({
        recipient: testUser._id,
        type: NOTIFICATION_TYPES.MENTION,
        message: 'You were mentioned in a comment',
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(notification.isRead).toBe(false);
    });

    test('should support soft delete with 30-day TTL', async () => {
      const notification = await Notification.create({
        recipient: testUser._id,
        type: NOTIFICATION_TYPES.UPDATED,
        message: 'Task updated',
        organization: testOrg._id,
        department: testDept._id,
      });

      await notification.softDelete();

      expect(notification.isDeleted).toBe(true);
      expect(notification.deletedAt).toBeInstanceOf(Date);
    });
  });
});
