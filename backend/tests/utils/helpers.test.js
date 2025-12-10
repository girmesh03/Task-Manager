import { jest, describe, test, expect } from '@jest/globals';
import mongoose from 'mongoose';
import {
  formatResponse,
  formatPaginatedResponse,
  validateObjectId,
  isValidObjectId,
  sanitizeUser,
  generateRandomToken,
  generateEmployeeId
} from '../../utils/helpers.js';

describe('Utils: helpers', () => {
  test('formatResponse should return correct structure', () => {
    const res = formatResponse(true, 'Success', { id: 1 });
    expect(res).toEqual({
      success: true,
      message: 'Success',
      data: { id: 1 }
    });
  });

  test('formatPaginatedResponse should return correct structure', () => {
    const docs = [{ id: 1 }];
    const pagination = {
      page: 1,
      limit: 10,
      totalDocs: 100,
      totalPages: 10,
      hasNextPage: true,
      hasPrevPage: false
    };
    const res = formatPaginatedResponse(true, 'Success', 'items', docs, pagination);

    expect(res.success).toBe(true);
    expect(res.data.items).toEqual(docs);
    expect(res.data.pagination.totalCount).toBe(100);
    expect(res.data.pagination.hasNext).toBe(true);
  });

  test('validateObjectId should validate ObjectIds', () => {
    const validId = new mongoose.Types.ObjectId().toString();
    expect(validateObjectId(validId)).toBe(true);
    expect(validateObjectId('invalid')).toBe(false);
  });

  test('isValidObjectId should be an alias for validateObjectId', () => {
    const validId = new mongoose.Types.ObjectId().toString();
    expect(isValidObjectId(validId)).toBe(true);
  });

  test('sanitizeUser should remove sensitive fields', () => {
    const user = {
      name: 'Test',
      password: 'hash',
      passwordResetToken: 'token',
      __v: 0,
      isDeleted: false
    };
    const sanitized = sanitizeUser(user);

    expect(sanitized.name).toBe('Test');
    expect(sanitized.password).toBeUndefined();
    expect(sanitized.passwordResetToken).toBeUndefined();
    expect(sanitized.__v).toBeUndefined();
  });

  test('generateRandomToken should return a string', () => {
    const token = generateRandomToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });



  test('generateEmployeeId should return 4 digit string', () => {
    const id = generateEmployeeId();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(4);
    const num = parseInt(id, 10);
    expect(num).toBeGreaterThanOrEqual(1000);
    expect(num).toBeLessThanOrEqual(9999);
  });
});
