import nodemailer from "nodemailer";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./EmailTemplates.js";
import CustomError from "../errorHandler/CustomError.js";

// HTML sanitization function
const sanitizeHtml = (html) => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Create reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    rateLimit: 5, // Max 5 messages per second
    maxConnections: 5,
    maxMessages: 100,
  });
};

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = createTransporter();
    const sanitizedToken = sanitizeHtml(verificationToken);

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        sanitizedToken
      ),
      category: "Email Verification",
      text: `Please use the following verification code: ${sanitizedToken}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Verification Email Error:", error);
    throw new CustomError("Error sending verification email", 500, "EMAIL-500");
  }
};

export const sendResetPasswordEmail = async (email, resetURL) => {
  try {
    const transporter = createTransporter();
    const sanitizedURL = sanitizeHtml(resetURL);

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", sanitizedURL),
      category: "Password Reset",
      text: `Reset your password using this link: ${sanitizedURL}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Password Reset Email Error:", error);
    throw new CustomError(
      "Error sending password reset email",
      500,
      "EMAIL-500"
    );
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
      text: "Your password has been successfully reset.",
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Password Success Email Error:", error);
    throw new CustomError(
      "Error sending password reset success email",
      500,
      "EMAIL-500"
    );
  }
};

// Additional email function for task notifications
export const sendTaskNotificationEmail = async (email, subject, content) => {
  try {
    const transporter = createTransporter();
    const sanitizedContent = sanitizeHtml(content);

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #333;">${sanitizeHtml(subject)}</h2>
              <div>${sanitizedContent}</div>
            </div>`,
      text: `${subject}\n\n${content}`,
      category: "Task Notification",
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Task Notification Email Error:", error);
    throw new CustomError(
      "Error sending task notification email",
      500,
      "EMAIL-500"
    );
  }
};
