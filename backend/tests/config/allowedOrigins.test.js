import { jest, describe, beforeEach, afterAll, test, expect } from '@jest/globals';
import allowedOrigins from '../../config/allowedOrigins.js';

describe('Config: allowedOrigins', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should include default development origins', async () => {
    const origins = (await import('../../config/allowedOrigins.js')).default;
    expect(origins).toContain('http://localhost:3000');
    expect(origins).toContain('http://localhost:5173');
  });

  test('should include CLIENT_URL from env', async () => {
    process.env.CLIENT_URL = 'https://myapp.com';
    const origins = (await import('../../config/allowedOrigins.js')).default;
    expect(origins).toContain('https://myapp.com');
  });

  test('should include ALLOWED_ORIGINS from env', async () => {
    process.env.ALLOWED_ORIGINS = 'https://admin.myapp.com,https://partner.com';
    const origins = (await import('../../config/allowedOrigins.js')).default;
    expect(origins).toContain('https://admin.myapp.com');
    expect(origins).toContain('https://partner.com');
  });

  test('should filter out invalid URLs', async () => {
    process.env.ALLOWED_ORIGINS = 'invalid-url,https://valid.com';
    const origins = (await import('../../config/allowedOrigins.js')).default;
    expect(origins).toContain('https://valid.com');
    expect(origins).not.toContain('invalid-url');
  });

  test('should filter out wildcards', async () => {
    process.env.ALLOWED_ORIGINS = '*,https://valid.com';
    const origins = (await import('../../config/allowedOrigins.js')).default;
    expect(origins).toContain('https://valid.com');
    expect(origins).not.toContain('*');
  });
});
