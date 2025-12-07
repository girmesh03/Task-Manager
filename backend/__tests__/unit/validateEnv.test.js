import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import validateEnv from '../../utils/validateEnv.js';
import { logger } from '../../utils/logger.js';

// Mock logger to prevent console output during tests
// jest.mock('../../utils/logger.js', ...); // Removed

describe('validateEnv', () => {
  const originalEnv = process.env;
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should throw error if required variables are missing', () => {
    delete process.env.MONGODB_URI;
    expect(() => validateEnv()).toThrow('Missing required environment variables: MONGODB_URI');
  });

  it('should not throw error if all required variables are present', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_ACCESS_SECRET = 'secret';
    process.env.JWT_REFRESH_SECRET = 'secret';
    expect(() => validateEnv()).not.toThrow();
  });

  it('should log warning if optional variables are missing', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_ACCESS_SECRET = 'secret';
    process.env.JWT_REFRESH_SECRET = 'secret';
    delete process.env.PORT;

    validateEnv();
    expect(warnSpy).toHaveBeenCalled();
  });
});
