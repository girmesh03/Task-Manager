class CustomError extends Error {
  constructor(message, statusCode, errorCode = "OPERATIONAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errorCode = errorCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
