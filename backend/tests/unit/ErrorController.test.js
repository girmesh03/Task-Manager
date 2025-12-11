import globalErrorHandler from '../../errorHandler/ErrorController.js';
import CustomError from '../../errorHandler/CustomError.js';
import logger from '../../utils/logger.js';
import { jest } from '@jest/globals';

// Mock logger
// Remove jest.mock
// jest.mock('../../utils/logger.js', ...);

describe('ErrorController', () => {
  let req, res, next;

  beforeAll(() => {
    jest.spyOn(logger, 'error').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'info').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.NODE_ENV = 'development';
    jest.clearAllMocks();
  });

  describe('Development Environment', () => {
    test('should send full error details', () => {
      const error = new CustomError('Test error', 400, 'TEST_ERROR');
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        errorCode: 'TEST_ERROR',
        message: 'Test error',
        stack: expect.any(String),
        error: expect.any(Object),
      }));
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = 'test';
    });

    test('should send operational error message', () => {
      const error = new CustomError('Operational error', 400, 'OP_ERROR');
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errorCode: 'OP_ERROR',
        message: 'Operational error',
      });
    });

    test('should send generic message for non-operational error', () => {
      const error = new Error('Unknown error'); // Not operational by default
      globalErrorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Something went very wrong!',
      });
    });

    test('should handle CastError', () => {
      const error = { name: 'CastError', path: '_id', value: 'invalid-id' };
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errorCode: 'INVALID_ID',
        message: expect.stringContaining('Invalid _id: invalid-id'),
      }));
    });

    test('should handle DuplicateKey Error', () => {
      const error = { code: 11000, errmsg: 'dup key: { email: "test@test.com" }' };
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errorCode: 'DUPLICATE_FIELD',
        message: expect.stringContaining('Duplicate field value'),
      }));
    });

    test('should handle ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          field1: { message: 'Field1 is required' },
          field2: { message: 'Field2 is invalid' },
        },
      };
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errorCode: 'VALIDATION_ERROR',
        message: expect.stringContaining('Invalid input data'),
      }));
    });

    test('should handle JsonWebTokenError', () => {
      const error = { name: 'JsonWebTokenError' };
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errorCode: 'INVALID_TOKEN',
      }));
    });

    test('should handle TokenExpiredError', () => {
      const error = { name: 'TokenExpiredError' };
      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errorCode: 'TOKEN_EXPIRED',
      }));
    });
  });
});
