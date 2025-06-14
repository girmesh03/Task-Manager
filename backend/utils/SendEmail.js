// backend/utils/SendEmail.js
import nodemailer from "nodemailer";
import {
  fillTemplate,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./EmailTemplates.js";

// Create a single, reusable transporter object using the Singleton pattern.
// This is highly performant as it maintains a connection pool to the SMTP server.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // `true` for port 465, `false` for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * A generic, reusable function to send emails.
 * @param {object} options - Email options.
 * @param {string} options.to - Recipient's email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - HTML content of the email.
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    // We throw the original error to preserve the stack trace for better debugging.
    // The calling service is responsible for handling this failure.
    throw error;
  }
};

/**
 * Sends a verification code to a new user's email.
 * @param {string} email - The recipient's email.
 * @param {string} verificationCode - The 6-digit verification code.
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  const html = fillTemplate(VERIFICATION_EMAIL_TEMPLATE, { verificationCode });
  await sendEmail({
    to: email,
    subject: "Verify Your Account",
    html,
  });
};

/**
 * Sends a password reset link to a user's email.
 * @param {string} email - The recipient's email.
 * @param {string} resetURL - The URL containing the password reset token.
 */
export const sendResetPasswordEmail = async (email, resetURL) => {
  const html = fillTemplate(PASSWORD_RESET_REQUEST_TEMPLATE, { resetURL });
  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
};
