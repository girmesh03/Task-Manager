// backend/errorHandler/CustomError.js

/**
 * A custom error class that extends the native Error class.
 * It standardizes application-specific errors by including an HTTP status code
 * and an `isOperational` flag to distinguish between predictable application errors
 * (e.g., "User not found") and true programming errors.
 */
class CustomError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Marks this as a predictable, operational error.

    // Captures the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
