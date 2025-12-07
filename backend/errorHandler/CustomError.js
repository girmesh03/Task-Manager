class CustomError extends Error {
  constructor(message, statusCode, errorCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    return new CustomError(message, 400, errorCode);
  }

  static authenticated(message = 'Not Authenticated', errorCode = 'NOT_AUTHENTICATED') {
    return new CustomError(message, 401, errorCode);
  }

  static unauthorized(message = 'Not Authorized', errorCode = 'NOT_AUTHORIZED') {
    return new CustomError(message, 403, errorCode);
  }

  static notFound(message = 'Resource Not Found', errorCode = 'NOT_FOUND') {
    return new CustomError(message, 404, errorCode);
  }

  static conflict(message = 'Resource Conflict', errorCode = 'CONFLICT') {
    return new CustomError(message, 409, errorCode);
  }

  static validationError(message = 'Validation Error', errorCode = 'VALIDATION_ERROR') {
    return new CustomError(message, 422, errorCode);
  }

  static serviceUnavailable(message = 'Service Unavailable', errorCode = 'SERVICE_UNAVAILABLE') {
    return new CustomError(message, 503, errorCode);
  }

  static internalServer(message = 'Internal Server Error', errorCode = 'INTERNAL_SERVER_ERROR') {
    return new CustomError(message, 500, errorCode, false);
  }
}

export default CustomError;
