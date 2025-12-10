import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { generateAccess_token, generateRefresh_token, setTokenCookies } from '../../utils/generateTokens.js';

describe('Utils: generateTokens', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      NODE_ENV: 'development'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should generate valid access token', () => {
    const userId = 'user123';
    const token = generateAccess_token(userId);
    const decoded = jwt.verify(token, 'access-secret');
    expect(decoded.userId).toBe(userId);
  });

  test('should generate valid refresh token', () => {
    const userId = 'user123';
    const token = generateRefresh_token(userId);
    const decoded = jwt.verify(token, 'refresh-secret');
    expect(decoded.userId).toBe(userId);
  });

  test('should set cookies correctly in development', () => {
    const res = {
      cookie: jest.fn()
    };
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    setTokenCookies(res, accessToken, refreshToken);

    expect(res.cookie).toHaveBeenCalledWith('access_token', accessToken, expect.objectContaining({
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    }));

    expect(res.cookie).toHaveBeenCalledWith('refresh_token', refreshToken, expect.objectContaining({
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    }));
  });

  test('should set cookies correctly in production', () => {
    process.env.NODE_ENV = 'production';
    const res = {
      cookie: jest.fn()
    };
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    setTokenCookies(res, accessToken, refreshToken);

    expect(res.cookie).toHaveBeenCalledWith('access_token', accessToken, expect.objectContaining({
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    }));
  });
});
