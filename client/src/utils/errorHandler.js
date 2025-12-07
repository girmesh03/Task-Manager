class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', severity = 'error', type = 'general') {
    super(message);
    this.code = code;
    this.severity = severity; // 'error', 'warning', 'info', 'success'
    this.type = type; // 'general', 'auth', 'network', 'validation'
  }

  static badRequest(message = 'Bad Request') {
    return new AppError(message, 'BAD_REQUEST', 'error', 'validation');
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 'UNAUTHORIZED', 'error', 'auth');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 'FORBIDDEN', 'error', 'auth');
  }

  static notFound(message = 'Not Found') {
    return new AppError(message, 'NOT_FOUND', 'warning', 'general');
  }
}

export default AppError;
