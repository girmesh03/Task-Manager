import { describe, test, expect, beforeEach } from '@jest/globals';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import Vendor from '../../models/Vendor.js';
import ProjectTask from '../../models/ProjectTask.js';
import TaskActivity from '../../models/TaskActivity.js';
import TaskComment from '../../models/TaskComment.js';
import Notification from '../../models/Notification.js';
import { INDUSTRIES, TASK_ACTIVITY_TYPES, NOTIFICATION_TYPES } from '../../utils/constants.js';

describe('Cascade Delete Integration', () => {
  let testOrg;
  let testDept;
  let testUser;
  let testVendor;
  let testTask;

  beforeEach(async () => {
    // Setup Org, Dept, User
    testOrg = await Organization.create({
      name: 'Cascade Test Org',
      email: 'cascade@example.com',
      phone: '+251912340006',
      industry: INDUSTRIES[0],
    });

    testDept = await Department.create({
      name: 'Cascade Test Dept',
      organization: testOrg._id,
    });

    testUser = await User.create({
      firstName: 'Cascade',
      lastName: 'Tester',
      email: 'cascadetester@example.com',
      password: 'password123',
      organization: testOrg._id,
      department: testDept._id,
    });

    // Create test vendor
    testVendor = await Vendor.create({
      name: 'Cascade Test Vendor',
      organization: testOrg._id,
    });

    // Create a Task
    testTask = await ProjectTask.create({
      title: 'Task to Delete',
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
      vendor: testVendor._id,
    });
  });

  test('should cascade delete related resources when task is deleted', async () => {
    // 1. Create related resources

    // Activity
    const activity = await TaskActivity.create({
      task: testTask._id,
      activityType: TASK_ACTIVITY_TYPES.STATUS_CHANGED,
      description: 'Activity to delete',
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
    });

    // Root Comment
    const comment = await TaskComment.create({
      task: testTask._id,
      content: 'Comment to delete',
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
    });

    // Nested Comment
    const reply = await TaskComment.create({
      task: testTask._id,
      parent: comment._id,
      content: 'Reply to delete',
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
    });

    // Notification
    const notification = await Notification.create({
      recipient: testUser._id,
      type: NOTIFICATION_TYPES.CREATED,
      message: 'Notification to delete',
      relatedTask: testTask._id,
      organization: testOrg._id,
      department: testDept._id,
    });

    // 2. Perform Cascade Delete
    await ProjectTask.softDeleteByIdWithCascade(testTask._id, { deletedBy: testUser._id });

    // 3. Verify Task is deleted
    const deletedTask = await ProjectTask.findById(testTask._id);
    expect(deletedTask).toBeNull();
    const softDeletedTask = await ProjectTask.findById(testTask._id).withDeleted();
    expect(softDeletedTask.isDeleted).toBe(true);

    // 4. Verify Activity is deleted
    const deletedActivity = await TaskActivity.findById(activity._id);
    expect(deletedActivity).toBeNull();
    const softDeletedActivity = await TaskActivity.findById(activity._id).withDeleted();
    expect(softDeletedActivity.isDeleted).toBe(true);

    // 5. Verify Comments are deleted (Root + Reply)
    const deletedComment = await TaskComment.findById(comment._id);
    expect(deletedComment).toBeNull();
    const softDeletedComment = await TaskComment.findById(comment._id).withDeleted();
    expect(softDeletedComment.isDeleted).toBe(true);

    const deletedReply = await TaskComment.findById(reply._id);
    expect(deletedReply).toBeNull();
    const softDeletedReply = await TaskComment.findById(reply._id).withDeleted();
    expect(softDeletedReply.isDeleted).toBe(true);

    // 6. Verify Notification is deleted
    const deletedNotification = await Notification.findById(notification._id);
    expect(deletedNotification).toBeNull();
    const softDeletedNotification = await Notification.findById(notification._id).withDeleted();
    expect(softDeletedNotification.isDeleted).toBe(true);
  });
});
