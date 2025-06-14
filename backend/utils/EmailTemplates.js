// backend/utils/EmailTemplates.js

/**
 * A simple template engine to replace placeholders like {key} in HTML strings.
 * @param {string} template - The HTML template string.
 * @param {object} variables - An object with key-value pairs to replace.
 * @returns {string} The processed HTML string with values injected.
 */
export const fillTemplate = (template, variables) => {
  // Automatically add the application name to all templates for brand consistency.
  const allVars = {
    appName: process.env.APP_NAME || "Task Manager",
    ...variables,
  };
  // Replace all occurrences of {key} with the corresponding value.
  return template.replace(/\{(\w+)\}/g, (placeholder, key) => {
    return allVars.hasOwnProperty(key) ? allVars[key] : placeholder;
  });
};

export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<body>
  <h2>Welcome to {appName}!</h2>
  <p>Thank you for signing up. Please use the following verification code to activate your account:</p>
  <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">{verificationCode}</p>
  <p>This code will expire in 15 minutes.</p>
  <p>If you did not request this, please ignore this email.</p>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html>
<body>
  <h2>Password Reset for {appName}</h2>
  <p>You requested a password reset. Click the link below to set a new password:</p>
  <a href="{resetURL}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none;">Reset Password</a>
  <p>This link will expire in 1 hour.</p>
  <p>If you did not request this, please ignore this email.</p>
</body>
</html>
`;
