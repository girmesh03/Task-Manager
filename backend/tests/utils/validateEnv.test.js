import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import validateEnv from '../../utils/validateEnv.js';

describe('Utils: validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env vars before each test
    process.env = { ...originalEnv };
    // Mock console.error to suppress output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  test('should validate correct environment variables', () => {
    process.env = {
      NODE_ENV: 'development',
      PORT: '3000',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      JWT_ACCESS_SECRET: 'access',
      JWT_REFRESH_SECRET: 'refresh',
      CLIENT_URL: 'http://localhost:3000',
      ALLOWED_ORIGINS: 'http://localhost:3000'
    };

    expect(() => validateEnv(process.env, { reporter: ({ errors }) => {} })).not.toThrow();
  });

  test('should throw error if required variables are missing', () => {
    process.env = {
      NODE_ENV: 'development'
      // Missing other required vars
    };

    expect(() => validateEnv(process.env, { reporter: ({ errors }) => { throw new Error('Validation failed'); } })).toThrow();
  });

  test('should throw error if types are incorrect', () => {
    process.env = {
      NODE_ENV: 'development',
      PORT: 'not-a-number', // Invalid port
      MONGODB_URI: 'mongodb://localhost:27017/test',
      JWT_ACCESS_SECRET: 'access',
      JWT_REFRESH_SECRET: 'refresh',
      CLIENT_URL: 'http://localhost:3000'
    };

    expect(() => validateEnv(process.env, { reporter: ({ errors }) => { throw new Error('Validation failed'); } })).toThrow();
  });

  test('should validate NODE_ENV choices', () => {
    process.env = {
      NODE_ENV: 'invalid-env', // Invalid choice
      PORT: '3000',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      JWT_ACCESS_SECRET: 'access',
      JWT_REFRESH_SECRET: 'refresh',
      CLIENT_URL: 'http://localhost:3000'
    };

    expect(() => validateEnv(process.env, { reporter: ({ errors }) => { throw new Error('Validation failed'); } })).toThrow();
  });
});
