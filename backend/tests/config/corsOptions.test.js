import { jest, describe, test, expect } from '@jest/globals';
import corsOptions from '../../config/corsOptions.js';
import allowedOrigins from '../../config/allowedOrigins.js';

describe('Config: corsOptions', () => {
  test('should allow requests with no origin', (done) => {
    corsOptions.origin(undefined, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  test('should allow requests from allowed origins', (done) => {
    const validOrigin = allowedOrigins[0];
    corsOptions.origin(validOrigin, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  test('should block requests from disallowed origins', (done) => {
    const invalidOrigin = 'http://evil.com';
    // Mock console.warn to suppress output during test
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    corsOptions.origin(invalidOrigin, (err, allow) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Not allowed by CORS');
      expect(consoleSpy).toHaveBeenCalledWith(`Blocked by CORS: ${invalidOrigin}`);
      consoleSpy.mockRestore();
      done();
    });
  });

  test('should have correct configuration options', () => {
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.methods).toContain('GET');
    expect(corsOptions.methods).toContain('POST');
    expect(corsOptions.allowedHeaders).toContain('Content-Type');
    expect(corsOptions.exposedHeaders).toContain('X-Request-ID');
    expect(corsOptions.maxAge).toBe(86400);
  });
});
