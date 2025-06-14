// backend/errorHandler/ErrorController.js
import CustomError from "./CustomError.js";

// === Specific Error Handlers ===

/**
 * Handles Mongoose CastError (e.g., invalid ObjectId format).
 * @param {object} error - The original Mongoose error object.
 * @returns {CustomError} A standardized CustomError instance.
 */
const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new CustomError(message, 400);
};

/**
 * Handles Mongoose duplicate key errors (code 11000).
 * @param {object} error - The original Mongoose error object.
 * @returns {CustomError} A standardized CustomError instance.
 */
const handleDuplicateFieldsDB = (error) => {
  const value = Object.values(error.keyValue)[0];
  const field = Object.keys(error.keyValue)[0];
  const message = `Duplicate value for ${field}: '${value}'. Please use another value.`;
  return new CustomError(message, 409); // 409 Conflict is more appropriate
};

/**
 * Handles Mongoose validation errors.
 * @param {object} error - The original Mongoose error object.
 * @returns {CustomError} A standardized CustomError instance.
 */
const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new CustomError(message, 400);
};

// === Response Functions ===

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error to the console for the developer
    console.error("ERROR 💥", err);
    // 2) Send a generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// === Global Error Handling Middleware ===

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name, message: err.message };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
