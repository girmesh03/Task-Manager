/**
 * Email Service Unit Tests
 *
 * Tests for email service functionality.
 * Note: Uses mocked nodemailer to avoid actual email sending.
 */

import { jest } from '@jest/globals';

// Mock nodemailer before importing the service
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    })),
  },
}));

// Import after mocking
const {
  initializeEmailService,
  sendWelcomeEmail,
  sendTaskNotification,
  sendMentionNotification,
  sendPasswordResetEmail,
} = await import('../../services/emailService.js');

describe('Email Service', () => {
  beforeAll(async () => {
    // Set required env vars
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpassword';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    // Initialize service
    await initializeEmailService();
  });

  describe('sendWelcomeEmail', () => {
    test('should send welcome email with correct data', async () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        organization: { name: 'Test Org' },
      };

      const result = await sendWelcomeEmail(user);
      expect(result).toBe(true);
    });
  });

  describe('sendTaskNotification', () => {
    test('should send task notification email', async () => {
      const user = {
        firstName: 'Jane',
        email: 'jane@example.com',
        emailPreferences: { taskUpdates: true },
      };
      const task = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Task',
        description: 'Test description',
        priority: 'High',
        status: 'In Progress',
        createdBy: { firstName: 'Admin' },
      };

      const result = await sendTaskNotification(user, task, 'created');
      expect(result).toBe(true);
    });

    test('should skip email if user disabled task updates', async () => {
      const user = {
        firstName: 'Jane',
        email: 'jane@example.com',
        emailPreferences: { taskUpdates: false },
      };
      const task = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Task',
        description: 'Test description',
      };

      const result = await sendTaskNotification(user, task, 'created');
      expect(result).toBe(false);
    });
  });

  describe('sendMentionNotification', () => {
    test('should send mention notification email', async () => {
      const user = {
        firstName: 'Bob',
        email: 'bob@example.com',
        emailPreferences: { mentions: true },
      };
      const comment = {
        content: 'Hey @bob check this out',
        createdBy: { firstName: 'Alice' },
      };
      const task = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Task',
      };

      const result = await sendMentionNotification(user, comment, task);
      expect(result).toBe(true);
    });
  });

  describe('sendPasswordResetEmail', () => {
    test('should send password reset email', async () => {
      const user = {
        firstName: 'Test',
        email: 'test@example.com',
      };
      const resetToken = 'abc123token';

      const result = await sendPasswordResetEmail(user, resetToken);
      expect(result).toBe(true);
    });
  });
});
