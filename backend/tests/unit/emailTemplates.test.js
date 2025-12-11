/**
 * Email Templates Unit Tests
 *
 * Tests for email template rendering.
 */

import {
  getWelcomeEmailTemplate,
  getTaskNotificationTemplate,
  getMentionNotificationTemplate,
  getPasswordResetTemplate,
  getAnnouncementTemplate,
} from '../../templates/emailTemplates.js';

describe('Email Templates', () => {
  describe('getWelcomeEmailTemplate', () => {
    test('should return HTML with user data', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Test Org',
        email: 'john@example.com',
        loginUrl: 'http://localhost:3000/login',
      };

      const html = getWelcomeEmailTemplate(data);

      expect(html).toContain('John Doe');
      expect(html).toContain('Test Org');
      expect(html).toContain('john@example.com');
      expect(html).toContain('http://localhost:3000/login');
      expect(html).toContain('Welcome to Task Manager');
    });
  });

  describe('getTaskNotificationTemplate', () => {
    test('should return HTML with task data', () => {
      const data = {
        firstName: 'Jane',
        taskTitle: 'Complete Report',
        action: 'created',
        taskUrl: 'http://localhost:3000/tasks/123',
        description: 'Please complete this report by Friday',
        priority: 'High',
        status: 'In Progress',
        createdBy: 'Admin',
      };

      const html = getTaskNotificationTemplate(data);

      expect(html).toContain('Jane');
      expect(html).toContain('Complete Report');
      expect(html).toContain('created');
      expect(html).toContain('High');
      expect(html).toContain('In Progress');
    });

    test('should handle missing optional fields', () => {
      const data = {
        firstName: 'Jane',
        taskTitle: 'Simple Task',
        action: 'updated',
        taskUrl: 'http://localhost:3000/tasks/456',
      };

      const html = getTaskNotificationTemplate(data);

      expect(html).toContain('Jane');
      expect(html).toContain('Simple Task');
      // Should use defaults
      expect(html).toContain('Medium'); // default priority
    });
  });

  describe('getMentionNotificationTemplate', () => {
    test('should return HTML with mention data', () => {
      const data = {
        firstName: 'Bob',
        mentionedBy: 'Alice',
        commentContent: 'Hey @bob, can you check this?',
        taskTitle: 'Review PR',
        taskUrl: 'http://localhost:3000/tasks/789',
      };

      const html = getMentionNotificationTemplate(data);

      expect(html).toContain('Bob');
      expect(html).toContain('Alice');
      expect(html).toContain('Hey @bob, can you check this?');
      expect(html).toContain('Review PR');
    });

    test('should truncate long comments', () => {
      const longComment = 'A'.repeat(400);
      const data = {
        firstName: 'Bob',
        mentionedBy: 'Alice',
        commentContent: longComment,
        taskTitle: 'Test',
        taskUrl: 'http://localhost:3000/tasks/999',
      };

      const html = getMentionNotificationTemplate(data);

      // Should truncate at 300 chars and add ellipsis
      expect(html).toContain('...');
      expect(html.length).toBeLessThan(longComment.length + 5000); // HTML overhead
    });
  });

  describe('getPasswordResetTemplate', () => {
    test('should return HTML with reset link', () => {
      const data = {
        firstName: 'Test',
        resetUrl: 'http://localhost:3000/reset-password/token123',
      };

      const html = getPasswordResetTemplate(data);

      expect(html).toContain('Test');
      expect(html).toContain('http://localhost:3000/reset-password/token123');
      expect(html).toContain('1 hour');
    });
  });

  describe('getAnnouncementTemplate', () => {
    test('should return HTML with announcement data', () => {
      const data = {
        firstName: 'User',
        title: 'Important Update',
        message: 'We are updating our systems this weekend.',
        organizationName: 'Test Corp',
      };

      const html = getAnnouncementTemplate(data);

      expect(html).toContain('User');
      expect(html).toContain('Important Update');
      expect(html).toContain('We are updating our systems this weekend.');
      expect(html).toContain('Test Corp');
    });
  });
});
