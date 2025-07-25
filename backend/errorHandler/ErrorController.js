import CustomError from "./CustomError.js";

const handleSpecificErrors = (error) => {
  // Handle MongoDB CastError (invalid ObjectId)
  if (error.name === "CastError") {
    return new CustomError(
      `Invalid resource identifier: ${error.value}`,
      400,
      "INVALID_ID"
    );
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new CustomError(
      `${field} '${value}' already exists. Please use a different value.`,
      409,
      "DUPLICATE_FIELD"
    );
  }

  // Handle validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((el) => el.message);
    return new CustomError(
      `Validation failed: ${errors.join(". ")}`,
      422,
      "VALIDATION_FAILED"
    );
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return new CustomError(
      "Invalid authentication token. Please log in again.",
      401,
      "INVALID_TOKEN"
    );
  }

  // Handle expired tokens
  if (error.name === "TokenExpiredError") {
    return new CustomError(
      "Your authentication token has expired. Please log in again.",
      401,
      "TOKEN_EXPIRED"
    );
  }

  // Handle rate limiting errors
  if (error.statusCode === 429) {
    return new CustomError(
      "Too many requests. Please try again later.",
      429,
      "RATE_LIMITED"
    );
  }

  return error;
};

const globalErrorHandler = (error, req, res, next) => {
  // Log error details for server-side debugging
  console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
  console.error(`Error Code: ${error.errorCode || "UNKNOWN_CODE"}`);
  console.error(`Path: ${req.originalUrl}`);
  console.error(`Stack: ${error.stack}`);

  // Process specific error types
  const handledError = handleSpecificErrors(error);

  // Determine if we should show error details
  const isDevelopment = process.env.NODE_ENV === "development";
  const showDetails = isDevelopment || handledError.isOperational;

  // Prepare error response
  const errorResponse = {
    status: handledError.status || "error",
    message: showDetails
      ? handledError.message
      : "An unexpected error occurred",
    errorCode: handledError.errorCode || "UNKNOWN_ERROR",
    ...(showDetails && {
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    }),
    ...(isDevelopment && { stack: handledError.stack }),
  };

  // Send error response
  res.status(handledError.statusCode || 500).json(errorResponse);
};

export default globalErrorHandler;
