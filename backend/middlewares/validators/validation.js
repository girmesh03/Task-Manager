import { validationResult } from 'express-validator';
import CustomError from '../../errorHandler/CustomError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  // Create a readable error message from the first error
  const firstError = errors.array()[0];
  const message = `${firstError.path}: ${firstError.msg}`;

  throw CustomError.badRequest(message, 'VALIDATION_ERROR');
};
