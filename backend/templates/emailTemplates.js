/**
 * Email Templates
 *
 * HTML templates for various email notifications.
 * Each function returns HTML string with placeholders replaced.
 *
 * @module templates/emailTemplates
 */

/**
 * Common email styles
 */
const getStyles = () => `
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .content p {
      color: #333;
      line-height: 1.6;
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .info-box strong {
      color: #333;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    .footer a {
      color: #667eea;
    }
    .priority-high { color: #e53935; font-weight: 600; }
    .priority-medium { color: #fb8c00; font-weight: 600; }
    .priority-low { color: #43a047; font-weight: 600; }
    .priority-urgent { color: #d32f2f; font-weight: 700; }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-todo { background: #e3f2fd; color: #1565c0; }
    .status-inprogress { background: #fff3e0; color: #ef6c00; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-pending { background: #fce4ec; color: #c2185b; }
  </style>
`;

/**
 * Get welcome email template
 * @param {object} data - Template data
 * @param {string} data.firstName - User's first name
 * @param {string} data.lastName - User's last name
 * @param {string} data.organizationName - Organization name
 * @param {string} data.email - User's email
 * @param {string} data.loginUrl - Login URL
 * @returns {string} HTML template
 */
export const getWelcomeEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Task Manager!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.firstName} ${data.lastName}</strong>,</p>
      <p>Welcome to <strong>${data.organizationName}</strong>! Your account has been created successfully.</p>

      <div class="info-box">
        <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
        <p style="margin: 5px 0;"><strong>Organization:</strong> ${data.organizationName}</p>
      </div>

      <p>You can now log in and start managing your tasks efficiently.</p>

      <p style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Login Now</a>
      </p>

      <p>If you have any questions, please contact your administrator.</p>

      <p>Best regards,<br><strong>Task Manager Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from Task Manager.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Get task notification email template
 * @param {object} data - Template data
 * @param {string} data.firstName - Recipient's first name
 * @param {string} data.taskTitle - Task title
 * @param {string} data.action - Action performed
 * @param {string} data.taskUrl - Task URL
 * @param {string} data.description - Task description
 * @param {string} data.priority - Task priority
 * @param {string} data.status - Task status
 * @param {string} data.createdBy - User who performed action
 * @returns {string} HTML template
 */
export const getTaskNotificationTemplate = (data) => {
  const priorityClass = `priority-${data.priority?.toLowerCase() || 'medium'}`;
  const statusClass = `status-${data.status?.toLowerCase().replace(/\s+/g, '') || 'todo'}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Task ${data.action}</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.firstName}</strong>,</p>
      <p>A task has been <strong>${data.action}</strong> by <strong>${data.createdBy}</strong>:</p>

      <div class="info-box">
        <p style="margin: 5px 0;"><strong>Title:</strong> ${data.taskTitle}</p>
        <p style="margin: 5px 0;"><strong>Priority:</strong> <span class="${priorityClass}">${data.priority || 'Medium'}</span></p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span class="status-badge ${statusClass}">${data.status || 'To Do'}</span></p>
        ${data.description ? `<p style="margin: 10px 0 5px 0;"><strong>Description:</strong></p><p style="margin: 5px 0; color: #666;">${data.description.substring(0, 200)}${data.description.length > 200 ? '...' : ''}</p>` : ''}
      </div>

      <p style="text-align: center;">
        <a href="${data.taskUrl}" class="button">View Task</a>
      </p>

      <p>Best regards,<br><strong>Task Manager Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from Task Manager.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Get mention notification email template
 * @param {object} data - Template data
 * @param {string} data.firstName - Mentioned user's first name
 * @param {string} data.mentionedBy - User who mentioned them
 * @param {string} data.commentContent - Comment content
 * @param {string} data.taskTitle - Associated task title
 * @param {string} data.taskUrl - Task URL
 * @returns {string} HTML template
 */
export const getMentionNotificationTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 You were mentioned!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.firstName}</strong>,</p>
      <p><strong>${data.mentionedBy}</strong> mentioned you in a comment on task "<strong>${data.taskTitle}</strong>":</p>

      <div class="info-box">
        <p style="margin: 5px 0; font-style: italic; color: #555;">"${data.commentContent.substring(0, 300)}${data.commentContent.length > 300 ? '...' : ''}"</p>
      </div>

      <p style="text-align: center;">
        <a href="${data.taskUrl}" class="button">View Comment</a>
      </p>

      <p>Best regards,<br><strong>Task Manager Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from Task Manager.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Get password reset email template
 * @param {object} data - Template data
 * @param {string} data.firstName - User's first name
 * @param {string} data.resetUrl - Password reset URL with token
 * @returns {string} HTML template
 */
export const getPasswordResetTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.firstName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <p style="text-align: center;">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
      </p>

      <div class="info-box">
        <p style="margin: 5px 0;"><strong>⚠️ Important:</strong></p>
        <p style="margin: 5px 0;">This link will expire in 1 hour.</p>
        <p style="margin: 5px 0;">If you didn't request this, please ignore this email.</p>
      </div>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${data.resetUrl}</p>

      <p>Best regards,<br><strong>Task Manager Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from Task Manager.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Get announcement email template
 * @param {object} data - Template data
 * @param {string} data.firstName - User's first name
 * @param {string} data.title - Announcement title
 * @param {string} data.message - Announcement message
 * @param {string} data.organizationName - Organization name
 * @returns {string} HTML template
 */
export const getAnnouncementTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 Announcement</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.firstName}</strong>,</p>
      <p>A new announcement has been posted for <strong>${data.organizationName}</strong>:</p>

      <div class="info-box">
        <p style="margin: 5px 0;"><strong>${data.title}</strong></p>
        <p style="margin: 10px 0 0 0; color: #555;">${data.message}</p>
      </div>

      <p>Best regards,<br><strong>Task Manager Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from Task Manager.</p>
    </div>
  </div>
</body>
</html>
`;

export default {
  getWelcomeEmailTemplate,
  getTaskNotificationTemplate,
  getMentionNotificationTemplate,
  getPasswordResetTemplate,
  getAnnouncementTemplate,
};
