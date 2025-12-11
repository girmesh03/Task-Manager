import CustomError from '../../errorHandler/CustomError.js';

describe('CustomError', () => {
  test('should create an instance with correct properties', () => {
    const error = new CustomError('Test error', 400, 'TEST_ERROR');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomError);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  test('should create non-operational error', () => {
    const error = new CustomError('Fatal error', 500, 'FATAL_ERROR', false);
    expect(error.isOperational).toBe(false);
  });

  describe('Factory Methods', () => {
    test('badRequest should return 400', () => {
      const error = CustomError.badRequest('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('BAD_REQUEST');
    });

    test('authenticated should return 401', () => {
      const error = CustomError.authenticated('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('NOT_AUTHENTICATED');
    });

    test('unauthorized should return 403', () => {
      const error = CustomError.unauthorized('Not authorized');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('NOT_AUTHORIZED');
    });

    test('notFound should return 404', () => {
      const error = CustomError.notFound('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
    });

    test('conflict should return 409', () => {
      const error = CustomError.conflict('Conflict');
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT');
    });

    test('validationError should return 422', () => {
      const error = CustomError.validationError('Validation error');
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    test('serviceUnavailable should return 503', () => {
      const error = CustomError.serviceUnavailable('Service unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.errorCode).toBe('SERVICE_UNAVAILABLE');
    });

    test('internalServer should return 500 and be non-operational', () => {
      const error = CustomError.internalServer('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(false);
    });
  });
});
