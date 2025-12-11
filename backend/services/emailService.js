/**
 * Email Service
 *
 * Handles email sending using Nodemailer with Gmail SMTP.
 * Implements async queue for non-blocking operation.
 *
 * @module services/emailService
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import {
  getWelcomeEmailTemplate,
  getTaskNotificationTemplate,
  getMentionNotificationTemplate,
  getPasswordResetTemplate,
  getAnnouncementTemplate,
} from '../templates/emailTemplates.js';

// Email transporter instance
let transporter = null;

/**
 * Initialize the email transporter with Gmail SMTP
 */
export const initializeEmailService = async () => {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    logger.info('Email service initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize email service: ${error.message}`);
    // Don't throw - email failures shouldn't break the app
  }
};

/**
 * Send an email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise<boolean>} Success status
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.warn('Email service not initialized, skipping email');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return false;
  }
};

/**
 * Send welcome email to new user
 * @param {object} user - User object
 * @returns {Promise<boolean>} Success status
 */
export const sendWelcomeEmail = async (user) => {
  const html = getWelcomeEmailTemplate({
    firstName: user.firstName,
    lastName: user.lastName,
    organizationName: user.organization?.name || 'your organization',
    email: user.email,
    loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000/login',
  });

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Task Manager!',
    html,
  });
};

/**
 * Send task notification email
 * @param {object} user - Recipient user object
 * @param {object} task - Task object
 * @param {string} action - Action performed (created, updated, deleted, restored)
 * @returns {Promise<boolean>} Success status
 */
export const sendTaskNotification = async (user, task, action) => {
  // Check user email preferences
  if (user.emailPreferences && !user.emailPreferences.taskUpdates) {
    logger.debug(`Skipping task email for ${user.email} - disabled in preferences`);
    return false;
  }

  const html = getTaskNotificationTemplate({
    firstName: user.firstName,
    taskTitle: task.title,
    action,
    taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}`,
    description: task.description,
    priority: task.priority,
    status: task.status,
    createdBy: task.createdBy?.firstName || 'System',
  });

  return sendEmail({
    to: user.email,
    subject: `Task ${action}: ${task.title}`,
    html,
  });
};

/**
 * Send mention notification email
 * @param {object} user - Mentioned user object
 * @param {object} comment - Comment object
 * @param {object} task - Associated task object
 * @returns {Promise<boolean>} Success status
 */
export const sendMentionNotification = async (user, comment, task) => {
  // Check user email preferences
  if (user.emailPreferences && !user.emailPreferences.mentions) {
    logger.debug(`Skipping mention email for ${user.email} - disabled in preferences`);
    return false;
  }

  const html = getMentionNotificationTemplate({
    firstName: user.firstName,
    mentionedBy: comment.createdBy?.firstName || 'Someone',
    commentContent: comment.content,
    taskTitle: task.title,
    taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}`,
  });

  return sendEmail({
    to: user.email,
    subject: `You were mentioned in: ${task.title}`,
    html,
  });
};

/**
 * Send password reset email
 * @param {object} user - User object
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>} Success status
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const html = getPasswordResetTemplate({
    firstName: user.firstName,
    resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`,
  });

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
  });
};

/**
 * Send announcement email to multiple users
 * @param {object[]} users - Array of user objects
 * @param {object} announcement - Announcement object
 * @returns {Promise<boolean>} Success status
 */
export const sendAnnouncementEmail = async (users, announcement) => {
  const results = await Promise.allSettled(
    users.map(async (user) => {
      // Check user email preferences
      if (user.emailPreferences && !user.emailPreferences.announcements) {
        logger.debug(`Skipping announcement email for ${user.email} - disabled in preferences`);
        return false;
      }

      const html = getAnnouncementTemplate({
        firstName: user.firstName,
        title: announcement.title,
        message: announcement.message,
        organizationName: user.organization?.name || 'your organization',
      });

      return sendEmail({
        to: user.email,
        subject: `Announcement: ${announcement.title}`,
        html,
      });
    })
  );

  const successCount = results.filter(
    (r) => r.status === 'fulfilled' && r.value === true
  ).length;
  logger.info(`Sent announcement to ${successCount}/${users.length} users`);

  return successCount > 0;
};

export default {
  initializeEmailService,
  sendWelcomeEmail,
  sendTaskNotification,
  sendMentionNotification,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
};
